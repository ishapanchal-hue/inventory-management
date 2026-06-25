/**
 * Home Page / Landing Page
 * 
 * Main entry point for the application. Features:
 * - Hero section with value proposition
 * - Feature overview with icons
 * - Call-to-action buttons (Login, Dashboard)
 * - Testimonial section
 * - Industry use cases
 * - Mini dashboard preview
 * - Responsive design for all screen sizes
 * - Smooth animations with Framer Motion
 * 
 * Route: /
 */

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  AlertTriangle,
  Percent,
  Truck,
  Brain,
  TrendingUp,
  Apple,
  Wheat,
  Milk,
  Cookie,
  Carrot,
  Fish,
} from "lucide-react"
import Link from "next/link"
import { MiniDashboardPreview } from "@/components/mini-dashboard-preview"
import { motion } from "framer-motion"

/**
 * HomePage component - Main landing page
 * @returns JSX.Element
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/20 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Brain className="h-8 w-8 text-chart-4" />
              <span className="text-xl font-bold text-foreground">{"LogiFlow"}</span>
            </motion.div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    className="text-foreground border-foreground/20 hover:bg-foreground/10 bg-sidebar-accent"
                  >
                    Login
                  </Button>
                </motion.div>
              </Link>
              <Link href="/dashboard">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-primary hover:bg-primary/90">Dashboard</Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Left border food icons */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-8 z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-3 rounded-full bg-primary"
          >
            <Apple className="h-8 w-8 text-popover-foreground" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-3 rounded-full bg-yellow-100"
          >
            <Wheat className="h-8 w-8 text-sidebar" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-3 rounded-full bg-sidebar"
          >
            <Carrot className="h-8 w-8 text-primary" />
          </motion.div>
        </div>

        {/* Right border food icons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-8 z-10">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-3 rounded-full bg-sidebar"
          >
            <Milk className="h-8 w-8 text-secondary" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-3 rounded-full bg-primary"
          >
            <Cookie className="h-8 w-8 text-popover-foreground" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-3 rounded-full bg-yellow-100"
          >
            <Fish className="h-8 w-8 text-sidebar" />
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className=""
          >
            <Badge className="mb-6 border-primary/30 bg-sidebar text-secondary">AI-Powered Intelligence</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance text-lime-100">
              AI-Powered Inventory &<span className="bg-background text-lime-200"> Demand Intelligence</span>
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-pretty text-yellow-50">
              Reduce waste, optimize logistics and forecast demands for perishables with cutting-edge AI analytics
            </p>
          </motion.div>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/dashboard">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="hover:bg-primary/90 text-sidebar bg-yellow-100">
                  Start Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/login">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-foreground border-foreground/20 hover:bg-foreground/10 bg-sidebar"
                >
                  Login / Signup
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-sidebar/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid lg:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              <motion.blockquote
                className="text-2xl md:text-3xl font-bold text-foreground leading-relaxed"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                "In India, nearly <span className="text-lime-200">40%</span> of fruits and vegetables are lost before
                reaching consumers — not from scarcity, but from inefficient supply chains."{" "}
                <span className="text-lime-200">AI-driven logistics can change that.</span>
              </motion.blockquote>
              <motion.div
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div></div>
              </motion.div>
            </div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/modern-food-inventory-warehouse-with-fresh-fruits-.jpg"
                  alt="Modern food inventory warehouse with organized shelves of fresh produce"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Inventory Status</p>
                        <p className="text-xs text-gray-600">Real-time monitoring</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-green-700">Optimal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 how-it-works-bg">
        {" "}
        {/* Added background color class */}
        <div className="max-w-7xl mx-auto text-primary">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary-foreground">
              How AI optimizes Inventory Management{" "}
            </h2>
            <p className="text-xl max-w-2xl mx-auto text-popover-foreground">{"From Prediction to Action"}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Predict Demand",
                desc: "AI algorithms analyze historical data and market trends to forecast demand with 95% accuracy",
                color: "primary",
              },
              {
                icon: AlertTriangle,
                title: "Expiry Risk Analysis",
                desc: "Real-time monitoring of product expiry dates with intelligent risk assessment and alerts",
                color: "secondary",
              },
              {
                icon: Percent,
                title: "Automated Discounts",
                desc: "Dynamic pricing algorithms automatically suggest optimal discounts to maximize revenue",
                color: "primary",
              },
              {
                icon: Truck,
                title: "Transport Alerts",
                desc: "Live tracking of delivery routes with predictive alerts for delays and risks",
                color: "secondary",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <Card className="shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 floating-card opacity-90 shadow-xl border-sidebar border-none border-0 bg-background">
                  <CardHeader className="text-center">
                    <motion.div
                      className={`mx-auto mb-4 p-3 bg- bg-chart-4 text-yellow-100${item.color}/20 rounded-full w-fit`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <item.icon className={`h-8 w-8 text- text-sidebar${item.color}`} />
                    </motion.div>
                    <CardTitle className="text-chart-4">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center font-sans text-primary">{item.desc}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <MiniDashboardPreview />
          </motion.div>
        </div>
      </section>

      {/* Perfect for every business - Replaced Partners section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-sidebar/20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            className="font-bold mb-4 text-4xl md:text-5xl text-yellow-50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Perfect for every business
          </motion.h2>
          <motion.p
            className="text-xl mb-16 max-w-2xl mx-auto text-yellow-50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            AI-powered inventory management tailored for your industry needs
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "For Retailers",
                icon: "🏪",
                description: "Optimize stock levels and reduce waste with smart demand forecasting",
                color: "from-blue-500/20 to-blue-600/20",
                iconBg: "bg-blue-500/20",
                textColor: "text-blue-600",
              },
              {
                title: "For Logistic Managers",
                icon: "🚛",
                description: "Track shipments and predict delivery risks in real-time",
                color: "from-green-500/20 to-green-600/20",
                iconBg: "bg-green-500/20",
                textColor: "text-green-600",
              },
              {
                title: "For MSMEs",
                icon: "🏢",
                description: "Scale efficiently with automated inventory insights and alerts",
                color: "from-purple-500/20 to-purple-600/20",
                iconBg: "bg-purple-500/20",
                textColor: "text-purple-600",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
                className="group"
              >
                <Card
                  className={`relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br bg-sidebar ${item.color} backdrop-blur-sm`}
                >
                  <CardHeader className="text-center pb-4">
                    <motion.div
                      className={`mx-auto mb-4 p-4 bg-sidebar-accent ${item.iconBg} rounded-2xl w-fit text-4xl`}
                      whileHover={{
                        rotate: [0, -10, 10, -10, 0],
                        scale: 1.1,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {item.icon}
                    </motion.div>
                    <CardTitle
                      className={`text-2xl font-bold text-lime-100 ${item.textColor} group-hover:scale-105 transition-transform duration-300`}
                    >
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-lg text-card/80 leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardContent>

                  {/* Floating background elements */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full animate-pulse" />
                  <div
                    className="absolute bottom-4 left-4 w-6 h-6 bg-white/5 rounded-full animate-bounce"
                    style={{ animationDelay: "1s" }}
                  />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div className="flex items-center space-x-2 mb-4 md:mb-0" whileHover={{ scale: 1.05 }}>
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-sidebar-foreground">{"LogiFlow"}</span>
            </motion.div>
            <div className="flex space-x-6">
              {[
                { href: "/about", text: "About" },
                { href: "/contact", text: "Contact" },
                { href: "https://github.com", text: "GitHub" },
              ].map((link, index) => (
                <motion.div key={index} whileHover={{ y: -2 }}>
                  <Link href={link.href} className="text-sidebar-foreground hover:text-primary transition-colors">
                    {link.text}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-sidebar-border text-center text-sidebar-foreground/60">
            <p>&copy; 2024 AI Inventory Intelligence. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
