import Papa from "papaparse"

import type { InventoryRecord } from "@/lib/types"

export const REQUIRED_CSV_FIELDS = [
  "product_id",
  "product_name",
  "category",
  "quantity",
  "price",
  "expiry_date",
  "warehouse",
  "daily_sales",
] as const

type CsvField = (typeof REQUIRED_CSV_FIELDS)[number]
type RawCsvRow = Record<CsvField, string>

export interface CsvValidationResult {
  records: InventoryRecord[]
  errors: string[]
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime())
}

export function parseInventoryCsv(file: File): Promise<CsvValidationResult> {
  return new Promise((resolve) => {
    Papa.parse<RawCsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const headers = result.meta.fields ?? []
        const missingFields = REQUIRED_CSV_FIELDS.filter((field) => !headers.includes(field))
        const errors = missingFields.map((field) => `Missing required column: ${field}`)

        const records: InventoryRecord[] = []

        result.data.forEach((row, index) => {
          const rowNumber = index + 2
          const quantity = Number(row.quantity)
          const price = Number(row.price)
          const dailySales = Number(row.daily_sales)

          REQUIRED_CSV_FIELDS.forEach((field) => {
            if (!String(row[field] ?? "").trim()) {
              errors.push(`Row ${rowNumber}: ${field} is required`)
            }
          })

          if (!Number.isFinite(quantity) || quantity < 0) errors.push(`Row ${rowNumber}: quantity must be >= 0`)
          if (!Number.isFinite(price) || price < 0) errors.push(`Row ${rowNumber}: price must be >= 0`)
          if (!Number.isFinite(dailySales) || dailySales < 0) errors.push(`Row ${rowNumber}: daily_sales must be >= 0`)
          if (!isValidDate(row.expiry_date)) errors.push(`Row ${rowNumber}: expiry_date must be YYYY-MM-DD`)

          if (errors.length === 0 || !errors.some((error) => error.startsWith(`Row ${rowNumber}:`))) {
            records.push({
              product_id: row.product_id.trim(),
              product_name: row.product_name.trim(),
              category: row.category.trim(),
              quantity,
              price,
              expiry_date: row.expiry_date.trim(),
              warehouse: row.warehouse.trim(),
              daily_sales: dailySales,
            })
          }
        })

        result.errors.forEach((error) => errors.push(error.message))
        resolve({ records, errors })
      },
      error: (error) => resolve({ records: [], errors: [error.message] }),
    })
  })
}
