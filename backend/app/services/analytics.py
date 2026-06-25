from collections import defaultdict
from datetime import date, timedelta

import pandas as pd
from sqlalchemy.orm import Session

from app.models import Inventory
from app.schemas import AnomalyItem, ExpiryRiskItem, ForecastPoint, RevenueCategory, RevenueResponse, RevenueTrendPoint


def _inventory_rows(db: Session) -> list[Inventory]:
    return db.query(Inventory).order_by(Inventory.created_at.desc()).all()


def build_forecast(db: Session, horizon_days: int = 30) -> list[ForecastPoint]:
    rows = _inventory_rows(db)
    if not rows:
        return []

    result: list[ForecastPoint] = []
    today = date.today()

    for item in rows:
        base = max(item.daily_sales, 0.0)
        try:
            from prophet import Prophet

            history = pd.DataFrame(
                {
                    "ds": [today - timedelta(days=day) for day in range(29, -1, -1)],
                    "y": [max(base * (0.85 + (day % 7) * 0.04), 0.0) for day in range(30)],
                }
            )
            model = Prophet(daily_seasonality=True, weekly_seasonality=True, yearly_seasonality=False)
            model.fit(history)
            future = model.make_future_dataframe(periods=horizon_days)
            forecast = model.predict(future).tail(horizon_days)

            for _, point in forecast.iterrows():
                result.append(
                    ForecastPoint(
                        product_id=item.product_id,
                        product_name=item.product_name,
                        category=item.category,
                        forecast_date=point["ds"].date(),
                        predicted_demand=max(float(point["yhat"]), 0.0),
                        lower_bound=max(float(point["yhat_lower"]), 0.0),
                        upper_bound=max(float(point["yhat_upper"]), 0.0),
                    )
                )
        except Exception:
            for offset in range(1, horizon_days + 1):
                seasonality = 1 + ((offset % 7) - 3) * 0.025
                predicted = max(base * seasonality, 0.0)
                result.append(
                    ForecastPoint(
                        product_id=item.product_id,
                        product_name=item.product_name,
                        category=item.category,
                        forecast_date=today + timedelta(days=offset),
                        predicted_demand=predicted,
                        lower_bound=predicted * 0.85,
                        upper_bound=predicted * 1.15,
                    )
                )

    return result


def build_expiry_risk(db: Session) -> list[ExpiryRiskItem]:
    rows = _inventory_rows(db)
    today = date.today()
    risks: list[ExpiryRiskItem] = []

    for item in rows:
        days = max((item.expiry_date - today).days, 0)
        coverage_days = item.quantity / max(item.daily_sales, 0.1)
        expiry_pressure = max(0.0, 1 - min(days, 30) / 30)
        stock_pressure = min(coverage_days / max(days, 1), 3) / 3
        velocity_pressure = min(item.daily_sales / max(item.quantity, 1), 1)
        score = round((expiry_pressure * 0.5 + stock_pressure * 0.35 + (1 - velocity_pressure) * 0.15) * 100, 2)

        if score >= 70:
            level = "High"
        elif score >= 40:
            level = "Medium"
        else:
            level = "Low"

        risks.append(
            ExpiryRiskItem(
                product_id=item.product_id,
                product_name=item.product_name,
                category=item.category,
                warehouse=item.warehouse,
                quantity=item.quantity,
                days_until_expiry=days,
                demand_velocity=item.daily_sales,
                risk_score=score,
                risk_level=level,
            )
        )

    return sorted(risks, key=lambda row: row.risk_score, reverse=True)


def detect_anomalies(db: Session) -> list[AnomalyItem]:
    rows = _inventory_rows(db)
    if len(rows) < 2:
        return []

    features = [[item.quantity, item.price, item.daily_sales] for item in rows]
    scores: list[float]

    try:
        from sklearn.ensemble import IsolationForest

        model = IsolationForest(contamination=min(0.25, max(0.05, 1 / len(rows))), random_state=42)
        model.fit(features)
        raw_scores = model.decision_function(features)
        predictions = model.predict(features)
        scores = [float(score) for score in raw_scores]
        anomaly_indexes = [index for index, prediction in enumerate(predictions) if prediction == -1]
    except Exception:
        avg_sales = sum(item.daily_sales for item in rows) / len(rows)
        avg_qty = sum(item.quantity for item in rows) / len(rows)
        scores = [abs(item.daily_sales - avg_sales) + abs(item.quantity - avg_qty) / 10 for item in rows]
        threshold = sum(scores) / len(scores)
        anomaly_indexes = [index for index, score in enumerate(scores) if score > threshold]

    anomalies: list[AnomalyItem] = []
    for index in anomaly_indexes:
        item = rows[index]
        demand_ratio = item.daily_sales / max(item.quantity, 1)
        if demand_ratio > 0.5:
            anomaly_type = "unusual demand spike"
            action = "Increase replenishment frequency and review local demand drivers."
            severity = "High"
        elif item.quantity > item.daily_sales * 20:
            anomaly_type = "inventory abnormality"
            action = "Review overstock, discount strategy, and warehouse allocation."
            severity = "Medium"
        else:
            anomaly_type = "supply chain disruption"
            action = "Check vendor lead time, route status, and recent stock movement."
            severity = "Low"

        anomalies.append(
            AnomalyItem(
                product_id=item.product_id,
                product_name=item.product_name,
                category=item.category,
                severity=severity,
                anomaly_type=anomaly_type,
                score=round(abs(scores[index]), 4),
                description=f"{item.product_name} shows {anomaly_type} signals in {item.warehouse}.",
                suggested_action=action,
            )
        )

    return anomalies


def build_revenue(db: Session) -> RevenueResponse:
    rows = _inventory_rows(db)
    if not rows:
        return RevenueResponse(total_revenue=0, trend=[], categories=[])

    category_totals: dict[str, float] = defaultdict(float)
    total = 0.0
    for item in rows:
        revenue = item.price * item.daily_sales * 30
        category_totals[item.category] += revenue
        total += revenue

    today = date.today()
    trend = [
        RevenueTrendPoint(
            date=today + timedelta(days=offset),
            actual_revenue=round(total / 30 * max(0, 1 - offset / 30), 2),
            projected_revenue=round(total / 30 * (1 + offset * 0.01), 2),
        )
        for offset in range(30)
    ]
    categories = [
        RevenueCategory(category=category, revenue=round(value, 2), share=round(value / total * 100, 2))
        for category, value in sorted(category_totals.items())
    ]
    return RevenueResponse(total_revenue=round(total, 2), trend=trend, categories=categories)
