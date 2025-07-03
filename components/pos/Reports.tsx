'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { 
  Calendar, Download, TrendingUp, DollarSign, 
  ShoppingCart, Users, Award
} from 'lucide-react'

import { format, subDays } from 'date-fns'
import toast from 'react-hot-toast'

// Type definitions for report data
interface SalesData {
  date: string
  revenue: number
  orders: number
  customers: number
}

interface MenuPerformance {
  name: string
  sales: number
  revenue: number
  color: string
}

interface HourlyData {
  hour: string
  orders: number
  revenue: number
}

interface ReportData {
  salesData: SalesData[]
  menuPerformance: MenuPerformance[]
  hourlyData: HourlyData[]
}

// Mock data for demo - in production this would come from your database
const generateMockData = (): ReportData => {
  const today = new Date()
  const salesData: SalesData[] = []
  const menuPerformance: MenuPerformance[] = []
  const hourlyData: HourlyData[] = []
  
  // Generate daily sales for last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i)
    salesData.push({
      date: format(date, 'MMM dd'),
      revenue: Math.floor(Math.random() * 50000) + 20000,
      orders: Math.floor(Math.random() * 80) + 30,
      customers: Math.floor(Math.random() * 120) + 50
    })
  }

  // Generate menu item performance
  const menuItems = [
    'Cappuccino', 'Caramel Latté', 'Caffé Mocha', 'Americano', 'Signature Iced Coffee',
    'The Grande Zinger', 'Sandwich', 'Mango Smoothie', 'Hot Chocolate', 'Chai Tea Latté'
  ]
  
  menuItems.forEach((item, index) => {
    menuPerformance.push({
      name: item,
      sales: Math.floor(Math.random() * 300) + 50,
      revenue: Math.floor(Math.random() * 30000) + 5000,
      color: `hsl(${index * 36}, 70%, 50%)`
    })
  })

  // Generate hourly sales
  for (let hour = 7; hour <= 22; hour++) {
    hourlyData.push({
      hour: `${hour}:00`,
      orders: Math.floor(Math.random() * 25) + 5,
      revenue: Math.floor(Math.random() * 15000) + 3000
    })
  }

  return { salesData, menuPerformance, hourlyData }
}

export default function Reports() {
  const [selectedView, setSelectedView] = useState<'overview' | 'sales' | 'menu' | 'staff'>('overview')
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('month')
  const [reportData, setReportData] = useState<ReportData | null>(null)

  useEffect(() => {
    // Load report data
    const data = generateMockData()
    setReportData(data)
  }, [dateRange])

  const handleExportReport = () => {
    // In production, this would generate and download actual report files
    toast.success('Report exported successfully!')
  }

  const getSummaryStats = () => {
    if (!reportData) return null

    const totalRevenue = reportData.salesData.reduce((sum: number, day: SalesData) => sum + day.revenue, 0)
    const totalOrders = reportData.salesData.reduce((sum: number, day: SalesData) => sum + day.orders, 0)
    const avgOrderValue = totalRevenue / totalOrders
    const totalCustomers = reportData.salesData.reduce((sum: number, day: SalesData) => sum + day.customers, 0)

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      totalCustomers,
      growth: 12.5 // Mock growth percentage
    }
  }

  const stats = getSummaryStats()

  if (!reportData || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive business insights and reports</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'overview', label: 'Overview', icon: TrendingUp },
              { key: 'sales', label: 'Sales', icon: DollarSign },
              { key: 'menu', label: 'Menu Performance', icon: Award },
              { key: 'staff', label: 'Staff Analytics', icon: Users }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedView(key as 'overview' | 'sales' | 'menu' | 'staff')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  selectedView === key
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'today' | 'week' | 'month' | 'custom')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+{stats.growth}%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Rs. {stats.totalRevenue.toLocaleString()}</h3>
          <p className="text-gray-600">Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm text-blue-600 font-medium">+8.2%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</h3>
          <p className="text-gray-600">Total Orders</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-100 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <span className="text-sm text-amber-600 font-medium">+5.1%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Rs. {Math.round(stats.avgOrderValue)}</h3>
          <p className="text-gray-600">Avg Order Value</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 rounded-lg p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm text-purple-600 font-medium">+15.3%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalCustomers.toLocaleString()}</h3>
          <p className="text-gray-600">Total Customers</p>
        </div>
      </div>

      {/* Main Content Based on Selected View */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={reportData.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fill="#fef3c7" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Sales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Sales Pattern</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedView === 'sales' && (
        <div className="space-y-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales Performance</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reportData.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `Rs. ${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Customers'
                  ]}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#f59e0b" name="revenue" />
                <Bar dataKey="orders" fill="#3b82f6" name="orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sales Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Days</h3>
              <div className="space-y-3">
                {reportData.salesData
                  .sort((a: SalesData, b: SalesData) => b.revenue - a.revenue)
                  .slice(0, 5)
                  .map((day: SalesData, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{day.date}</p>
                        <p className="text-sm text-gray-600">{day.orders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">Rs. {day.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Cash', value: 65, color: '#10b981' },
                      { name: 'Card', value: 35, color: '#3b82f6' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {[{ color: '#10b981' }, { color: '#3b82f6' }].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'menu' && (
        <div className="space-y-8">
          {/* Menu Performance Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu Item Performance</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reportData.menuPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value) => [`${value} units`, 'Sales']} />
                <Bar dataKey="sales" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Menu Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
              <div className="space-y-3">
                {reportData.menuPerformance
                  .sort((a: MenuPerformance, b: MenuPerformance) => b.sales - a.sales)
                  .slice(0, 5)
                  .map((item: MenuPerformance, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{item.sales} units</p>
                        <p className="text-sm text-gray-600">Rs. {item.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Coffee', value: 45, color: '#8b5cf6' },
                      { name: 'Food', value: 25, color: '#10b981' },
                      { name: 'Beverages', value: 20, color: '#f59e0b' },
                      { name: 'Desserts', value: 10, color: '#ef4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {[
                      { color: '#8b5cf6' },
                      { color: '#10b981' },
                      { color: '#f59e0b' },
                      { color: '#ef4444' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'staff' && (
        <div className="space-y-8">
          {/* Staff Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Admin User', orders: 145, revenue: 125000, rating: 4.9 },
                { name: 'Cashier 1', orders: 98, revenue: 87000, rating: 4.7 },
                { name: 'Cashier 2', orders: 76, revenue: 65000, rating: 4.5 }
              ].map((staff, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{staff.name}</h4>
                      <p className="text-sm text-gray-600">Rating: ⭐ {staff.rating}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Orders:</span>
                      <span className="font-medium">{staff.orders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium text-green-600">Rs. {staff.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Staff Hours */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Working Hours This Month</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Admin User', hours: 168, overtime: 12 },
                  { name: 'Cashier 1', hours: 160, overtime: 8 },
                  { name: 'Cashier 2', hours: 152, overtime: 4 }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#3b82f6" name="Regular Hours" />
                <Bar dataKey="overtime" fill="#f59e0b" name="Overtime" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
} 