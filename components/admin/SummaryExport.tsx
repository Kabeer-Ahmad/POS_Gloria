'use client'

import { useState, useEffect } from 'react'
import { 
  Download, Filter, FileText, 
  Package, X, ChevronDown,
  Play, Eye
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface OrderData {
  id: string
  order_number: string
  status: string
  subtotal: number
  gst_amount: number
  total: number
  payment_method: 'cash' | 'card'
  staff_id: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

interface OrderItem {
  id: string
  menu_item_id: string
  menu_item_name: string
  size: string
  quantity: number
  unit_price: number
  total_price: number
  extras: string[]
  extras_cost: number
}

interface MenuItem {
  id: string
  name: string
  category: string
  sizes: string[]
  prices: Record<string, number>
  description?: string
  image_url?: string
  is_active: boolean
}

interface SummaryData {
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
  categoryBreakdown: Record<string, { quantity: number, revenue: number }>
  paymentMethods: { cash: number, card: number }
  topItems: Array<{ name: string, quantity: number, revenue: number }>
  dateRange: { start: string, end: string }
  selectedCategories: string[]
}

export default function SummaryExport() {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showReport, setShowReport] = useState(false)
  
  // Filter states
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'>('month')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [useCustomRange, setUseCustomRange] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  // Summary data
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load orders with order items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false })

      if (ordersError) {
        console.error('Error fetching orders:', ordersError)
        toast.error('Failed to load orders from database')
        return
      }

      // Load menu items for category mapping
      const { data: menuItemsData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_active', true)

      if (menuError) {
        console.error('Error fetching menu items:', menuError)
        toast.error('Failed to load menu items from database')
        return
      }

      setOrders(ordersData || [])
      setMenuItems(menuItemsData || [])
      
      // Extract unique categories from menu items
      const uniqueCategories = [...new Set(menuItemsData?.map(item => item.category) || [])]
      setCategories(uniqueCategories.sort())
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const getDateRange = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    if (useCustomRange && customStartDate && customEndDate) {
      return {
        start: new Date(customStartDate),
        end: new Date(customEndDate + 'T23:59:59')
      }
    }

    switch (dateRange) {
      case 'today':
        return { start: today, end: new Date() }
      case 'week':
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return { start: weekAgo, end: new Date() }
      case 'month':
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return { start: monthAgo, end: new Date() }
      case 'quarter':
        const quarterAgo = new Date(today)
        quarterAgo.setMonth(quarterAgo.getMonth() - 3)
        return { start: quarterAgo, end: new Date() }
      case 'year':
        const yearAgo = new Date(today)
        yearAgo.setFullYear(yearAgo.getFullYear() - 1)
        return { start: yearAgo, end: new Date() }
      default:
        return { start: new Date(0), end: new Date() }
    }
  }

  // Helper function to get category for a menu item
  const getCategoryForMenuItem = (menuItemName: string): string => {
    const menuItem = menuItems.find(item => item.name === menuItemName)
    return menuItem?.category || 'Unknown Category'
  }

  const generateSummary = () => {
    if (orders.length === 0) {
      toast.error('No orders available to generate summary')
      return
    }

    const { start, end } = getDateRange()
    
    // Filter orders by date range
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at)
      return orderDate >= start && orderDate <= end
    })

    if (filteredOrders.length === 0) {
      toast.error('No orders found for the selected date range')
      return
    }

    // Calculate revenue and metrics based on filtered items only
    let totalRevenue = 0
    let totalFilteredItems = 0
    const paymentMethods = { cash: 0, card: 0 }

    // Top selling items (filtered by categories if selected)
    const itemSales: Record<string, { quantity: number, revenue: number }> = {}
    
    filteredOrders.forEach(order => {
      let orderHasMatchingItems = false
      
      order.order_items?.forEach(item => {
        // Check if item matches selected categories (if any)
        let includeItem = true
        if (selectedCategories.length > 0) {
          const itemCategory = getCategoryForMenuItem(item.menu_item_name)
          includeItem = selectedCategories.includes(itemCategory)
        }
        
        if (includeItem) {
          orderHasMatchingItems = true
          totalRevenue += item.total_price
          totalFilteredItems += item.quantity
          
          // Add to item sales for top items
          if (!itemSales[item.menu_item_name]) {
            itemSales[item.menu_item_name] = { quantity: 0, revenue: 0 }
          }
          itemSales[item.menu_item_name].quantity += item.quantity
          itemSales[item.menu_item_name].revenue += item.total_price
        }
      })
      
      // Only count payment method if order has matching items
      if (orderHasMatchingItems) {
        paymentMethods[order.payment_method]++
      }
    })

    // Check if any items match the filter
    if (totalFilteredItems === 0) {
      toast.error('No items found matching the selected categories')
      return
    }

    // Calculate average order value based on filtered items and orders with matching items
    const ordersWithMatchingItems = paymentMethods.cash + paymentMethods.card
    const avgOrderValue = ordersWithMatchingItems > 0 ? totalRevenue / ordersWithMatchingItems : 0

    // Category breakdown with proper filtering
    const categoryBreakdown: Record<string, { quantity: number, revenue: number }> = {}
    
    if (selectedCategories.length > 0) {
      // Initialize selected categories
      selectedCategories.forEach(category => {
        categoryBreakdown[category] = { quantity: 0, revenue: 0 }
      })
      
      filteredOrders.forEach(order => {
        order.order_items?.forEach(item => {
          const itemCategory = getCategoryForMenuItem(item.menu_item_name)
          if (selectedCategories.includes(itemCategory)) {
            categoryBreakdown[itemCategory].quantity += item.quantity
            categoryBreakdown[itemCategory].revenue += item.total_price
          }
        })
      })
    } else {
      // If no specific categories selected, group by actual categories from database
      filteredOrders.forEach(order => {
        order.order_items?.forEach(item => {
          const itemCategory = getCategoryForMenuItem(item.menu_item_name)
          if (!categoryBreakdown[itemCategory]) {
            categoryBreakdown[itemCategory] = { quantity: 0, revenue: 0 }
          }
          categoryBreakdown[itemCategory].quantity += item.quantity
          categoryBreakdown[itemCategory].revenue += item.total_price
        })
      })
    }

    const topItems = Object.entries(itemSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    setSummaryData({
      totalOrders: ordersWithMatchingItems, // This will be used internally but not displayed
      totalRevenue,
      avgOrderValue,
      categoryBreakdown,
      paymentMethods,
      topItems,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      selectedCategories: [...selectedCategories]
    })

    setShowReport(true)
    toast.success('Summary report generated successfully!')
  }

  const generatePDF = async () => {
    if (!summaryData) {
      toast.error('Please generate a summary report first')
      return
    }

    setIsGenerating(true)
    
    try {
      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Gloria Jean&#39;s Sales Summary</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #F59E0B; padding-bottom: 10px; }
            .company-name { color: #F59E0B; font-size: 24px; font-weight: bold; }
            .date-range { color: #666; margin-top: 5px; }
            .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
            .summary-card { background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B; }
            .card-title { font-weight: bold; color: #333; margin-bottom: 5px; }
            .card-value { font-size: 20px; font-weight: bold; color: #F59E0B; }
            .section { margin: 30px 0; }
            .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .payment-breakdown { display: flex; gap: 20px; }
            .payment-item { flex: 1; text-align: center; padding: 15px; background: #f9f9f9; border-radius: 8px; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Gloria Jean&#39;s Coffees</div>
            <div style="font-size: 16px; margin: 5px 0;">Sales Summary Report</div>
            <div class="date-range">
              Period: ${new Date(summaryData.dateRange.start).toLocaleDateString()} - ${new Date(summaryData.dateRange.end).toLocaleDateString()}
              ${summaryData.selectedCategories.length > 0 ? `| Categories: ${summaryData.selectedCategories.join(', ')}` : ''}
            </div>
          </div>

          <div class="summary-grid">
            <div class="summary-card">
              <div class="card-title">Total Revenue</div>
              <div class="card-value">Rs. ${summaryData.totalRevenue.toFixed(2)}</div>
              <div style="font-size: 12px; color: #666; margin-top: 5px;">From filtered items only</div>
            </div>
            <div class="summary-card">
              <div class="card-title">Average Order Value</div>
              <div class="card-value">Rs. ${summaryData.avgOrderValue.toFixed(2)}</div>
              <div style="font-size: 12px; color: #666; margin-top: 5px;">Revenue per order with matching items</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Payment Method Breakdown</div>
            <div class="payment-breakdown">
              <div class="payment-item">
                <div style="font-size: 16px; font-weight: bold;">Cash Payments</div>
                <div style="font-size: 20px; color: #10B981; margin: 5px 0;">${summaryData.paymentMethods.cash}</div>
                <div style="color: #666;">orders</div>
              </div>
              <div class="payment-item">
                <div style="font-size: 16px; font-weight: bold;">Card Payments</div>
                <div style="font-size: 20px; color: #3B82F6; margin: 5px 0;">${summaryData.paymentMethods.card}</div>
                <div style="color: #666;">orders</div>
              </div>
            </div>
          </div>

          ${Object.keys(summaryData.categoryBreakdown).length > 0 ? `
          <div class="section">
            <div class="section-title">Category Breakdown</div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Items Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(summaryData.categoryBreakdown).map(([category, data]) => `
                  <tr>
                    <td>${category}</td>
                    <td>${data.quantity}</td>
                    <td>Rs. ${data.revenue.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Top Selling Items</div>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Item Name</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${summaryData.topItems.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>Rs. ${item.revenue.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <div>Generated on ${new Date().toLocaleString()}</div>
            <div>Gloria Jean&#39;s Coffees POS System</div>
          </div>
        </body>
        </html>
      `

      // Create a blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `gloria-jeans-summary-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Summary report downloaded successfully!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF report')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const formatPrice = (price: number) => `Rs. ${price.toFixed(2)}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Summary & Export</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Configure filters and generate detailed sales reports
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={generateSummary}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              Generate Report
            </button>
            {summaryData && (
              <>
                <button
                  onClick={() => setShowReport(!showReport)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  {showReport ? 'Hide Report' : 'Show Report'}
                </button>
                <button
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Period
            </label>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value as 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all')
                setUseCustomRange(false)
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Categories Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categories (Optional)
            </label>
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-left flex items-center justify-between"
            >
              <span>
                {selectedCategories.length === 0 
                  ? 'All Categories' 
                  : `${selectedCategories.length} selected`}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {showCategoryDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Categories</span>
                    <button
                      onClick={() => setSelectedCategories([])}
                      className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400"
                    >
                      Clear All
                    </button>
                  </div>
                  {categories.map(category => (
                    <label key={category} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Custom Date Range Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Range
            </label>
            <button
              onClick={() => setUseCustomRange(!useCustomRange)}
              className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                useCustomRange
                  ? 'bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200'
                  : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              {useCustomRange ? 'Using Custom' : 'Use Custom'}
            </button>
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {useCustomRange && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Filter Summary */}
        {(selectedCategories.length > 0 || useCustomRange) && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Active Filters:</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedCategories.map(category => (
                <span key={category} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs rounded-full">
                  {category}
                  <button
                    onClick={() => handleCategoryToggle(category)}
                    className="hover:bg-amber-200 dark:hover:bg-amber-700 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {useCustomRange && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  Custom Date Range
                  <button
                    onClick={() => setUseCustomRange(false)}
                    className="hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Inline Report Display */}
      {showReport && summaryData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Report Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-amber-500">
            <h1 className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">
              Gloria Jean&#39;s Coffees
            </h1>
            <h2 className="text-xl text-gray-900 dark:text-white mb-2">Sales Summary Report</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Period: {new Date(summaryData.dateRange.start).toLocaleDateString()} - {new Date(summaryData.dateRange.end).toLocaleDateString()}
              {summaryData.selectedCategories.length > 0 && ` | Categories: ${summaryData.selectedCategories.join(', ')}`}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border-l-4 border-amber-500">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{formatPrice(summaryData.totalRevenue)}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">From filtered items only</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border-l-4 border-amber-500">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Average Order Value</h3>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{formatPrice(summaryData.avgOrderValue)}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Revenue per order with matching items</p>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
              Payment Method Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <h4 className="font-bold text-gray-900 dark:text-white">Cash Payments</h4>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 my-2">{summaryData.paymentMethods.cash}</p>
                <p className="text-gray-600 dark:text-gray-300">orders</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <h4 className="font-bold text-gray-900 dark:text-white">Card Payments</h4>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 my-2">{summaryData.paymentMethods.card}</p>
                <p className="text-gray-600 dark:text-gray-300">orders</p>
              </div>
            </div>
          </div>

          {/* Category Breakdown Section */}
          {Object.keys(summaryData.categoryBreakdown).length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                Category Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left font-bold text-gray-900 dark:text-white">
                        Category
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left font-bold text-gray-900 dark:text-white">
                        Items Sold
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left font-bold text-gray-900 dark:text-white">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summaryData.categoryBreakdown).map(([category, data], index) => (
                      <tr key={category} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white">
                          {category}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white">
                          {data.quantity}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white">
                          {formatPrice(data.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Selling Items Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
              Top Selling Items
              {summaryData.selectedCategories.length > 0 && (
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                  {' '}(filtered by selected categories)
                </span>
              )}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left font-bold text-gray-900 dark:text-white">
                      Rank
                    </th>
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left font-bold text-gray-900 dark:text-white">
                      Item Name
                    </th>
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left font-bold text-gray-900 dark:text-white">
                      Quantity Sold
                    </th>
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left font-bold text-gray-900 dark:text-white">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.topItems.map((item, index) => (
                    <tr key={item.name} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white">
                        {item.quantity}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white">
                        {formatPrice(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Report Footer */}
          <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-600">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Generated on {new Date().toLocaleString()}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Gloria Jean&#39;s Coffees POS System
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards - Only show if no report generated yet */}
      {!summaryData && !isLoading && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ready to Generate Report</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Configure your filters above and click &quot;Generate Report&quot; to create a detailed sales summary
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 max-w-md mx-auto border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 mb-2">
              <Package className="h-4 w-4" />
              <span className="font-medium">Tip:</span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Select specific categories to focus your report on particular product lines, or leave all categories unselected for a complete overview.
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Loading data...</p>
        </div>
      )}
    </div>
  )
} 