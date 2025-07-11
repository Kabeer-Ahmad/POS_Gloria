'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie
} from 'recharts'
import { 
  TrendingUp, DollarSign, ShoppingCart, RefreshCw, X, Search, Eye
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

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'analytics'>('overview')
  const [orders, setOrders] = useState<OrderData[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  
  // Filter states
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'card'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'draft' | 'held'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, dateFilter, paymentFilter, statusFilter, searchQuery])

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
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = useCallback(() => {
    let filtered = [...orders]

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at)
        
        switch (dateFilter) {
          case 'today':
            return orderDate >= today
          case 'week':
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return orderDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return orderDate >= monthAgo
          default:
            return true
        }
      })
    }

    // Payment method filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.payment_method === paymentFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.order_items?.some(item => 
          item.menu_item_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    setFilteredOrders(filtered)
  }, [orders, dateFilter, paymentFilter, statusFilter, searchQuery])

  const clearFilters = () => {
    setDateFilter('all')
    setPaymentFilter('all')
    setStatusFilter('all')
    setSearchQuery('')
  }

  const formatPrice = (price: number) => `Rs. ${price.toFixed(2)}`

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Helper function to get category for a menu item
  const getCategoryForMenuItem = (menuItemName: string): string => {
    // First try exact match
    let menuItem = menuItems.find(item => item.name === menuItemName)
    
    // If no exact match, try case-insensitive match
    if (!menuItem) {
      menuItem = menuItems.find(item => 
        item.name.toLowerCase() === menuItemName.toLowerCase()
      )
    }
    
    // If still no match, try partial match (for items with slight name variations)
    if (!menuItem) {
      menuItem = menuItems.find(item => 
        item.name.toLowerCase().includes(menuItemName.toLowerCase()) ||
        menuItemName.toLowerCase().includes(item.name.toLowerCase())
      )
    }
    
    return menuItem?.category || 'Unknown Category'
  }

  // Calculate analytics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = filteredOrders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const paymentMethodStats = {
    cash: filteredOrders.filter(o => o.payment_method === 'cash').length,
    card: filteredOrders.filter(o => o.payment_method === 'card').length
  }

  // Top selling items analytics
  const itemSales = filteredOrders.reduce((acc, order) => {
    order.order_items?.forEach(item => {
      if (!acc[item.menu_item_name]) {
        acc[item.menu_item_name] = { quantity: 0, revenue: 0 }
      }
      acc[item.menu_item_name].quantity += item.quantity
      acc[item.menu_item_name].revenue += item.total_price
    })
    return acc
  }, {} as Record<string, { quantity: number, revenue: number }>)

  const topItems = Object.entries(itemSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)

  // Category-based analytics
  const categorySales = filteredOrders.reduce((acc, order) => {
    order.order_items?.forEach(item => {
      const category = getCategoryForMenuItem(item.menu_item_name)
      if (!acc[category]) {
        acc[category] = { quantity: 0, revenue: 0, orders: new Set() }
      }
      acc[category].quantity += item.quantity
      acc[category].revenue += item.total_price
      acc[category].orders.add(order.id)
    })
    return acc
  }, {} as Record<string, { quantity: number, revenue: number, orders: Set<string> }>)

  const topCategories = Object.entries(categorySales)
    .map(([category, data]) => ({ 
      category, 
      quantity: data.quantity, 
      revenue: data.revenue,
      orderCount: data.orders.size
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // Daily sales data
  const salesByDate = filteredOrders.reduce((acc, order) => {
    const date = new Date(order.created_at).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = { revenue: 0, orders: 0 }
    }
    acc[date].revenue += order.total
    acc[date].orders += 1
    return acc
  }, {} as Record<string, { revenue: number, orders: number }>)

  const dailySales = Object.entries(salesByDate).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orders: data.orders,
    avgOrder: data.revenue / data.orders
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Chart colors for dark mode
  const chartColors = {
    primary: '#F59E0B', // amber-500
    secondary: '#10B981', // emerald-500
    tertiary: '#8B5CF6', // violet-500
    quaternary: '#EF4444', // red-500
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Orders & Reports</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredOrders.length} orders • {formatPrice(totalRevenue)} total revenue
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'today' | 'week' | 'month' | 'all')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'cash' | 'card')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'paid' | 'draft' | 'held')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="draft">Draft</option>
              <option value="held">Held</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Order number, item name..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {(dateFilter !== 'today' || paymentFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
          <button
            onClick={clearFilters}
            className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {/* Mobile: Dropdown for tabs */}
        <div className="sm:hidden mb-3">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as 'overview' | 'orders' | 'analytics')}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white rounded-md border border-gray-300 dark:border-gray-600"
          >
            <option value="overview">Overview</option>
            <option value="orders">Order List</option>
            <option value="analytics">Analytics</option>
          </select>
        </div>

        {/* Desktop: Tab buttons */}
        <div className="hidden sm:flex space-x-1">
          {[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
            { key: 'orders', label: 'Order List', icon: ShoppingCart },
            { key: 'analytics', label: 'Analytics', icon: BarChart }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'overview' | 'orders' | 'analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
                activeTab === key
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">Loading reports...</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Revenue</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailySales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => `Rs. ${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: number) => [formatPrice(value), 'Revenue']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke={chartColors.primary}
                        fill={chartColors.primary}
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Orders Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Orders</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailySales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: number) => [value, 'Orders']}
                      />
                      <Bar 
                        dataKey="orders" 
                        fill={chartColors.secondary}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Categories */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Categories by Revenue</h3>
                <div className="space-y-3">
                  {topCategories.slice(0, 5).map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{category.category}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{category.orderCount} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{formatPrice(category.revenue)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{category.quantity} items</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Items */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Selling Items</h3>
                <div className="space-y-3">
                  {topItems.slice(0, 5).map((item: { name: string; quantity: number; revenue: number }, index: number) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.quantity} sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{formatPrice(item.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Orders ({filteredOrders.length})
                </h3>
                
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No orders found matching the filters</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Order</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Items</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Payment</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="py-3 px-4">
                              <p className="font-medium text-gray-900 dark:text-white">{order.order_number}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                Status: {order.status}
                              </p>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {formatDate(order.created_at)}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {order.order_items?.length || 0} items
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                order.payment_method === 'cash' 
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                              }`}>
                                {order.payment_method?.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                              {formatPrice(order.total)}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Key Metrics */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3">
                      <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(totalRevenue)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
                      <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalOrders}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3">
                      <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Order Value</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(avgOrderValue)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Revenue Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue by Category</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCategories}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="category" 
                        stroke="#9CA3AF"
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => `Rs. ${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: number) => [formatPrice(value), 'Revenue']}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill={chartColors.tertiary}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Payment Methods Pie Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Cash', value: paymentMethodStats.cash, fill: chartColors.secondary },
                          { name: 'Card', value: paymentMethodStats.card, fill: chartColors.primary }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Details */}
              <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Performance Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Orders</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Items Sold</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Revenue</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Avg Revenue/Order</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCategories.map((category) => (
                        <tr key={category.category} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900 dark:text-white">{category.category}</p>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {category.orderCount}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {category.quantity}
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                            {formatPrice(category.revenue)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {formatPrice(category.revenue / category.orderCount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedOrder.order_number}</h3>
                <p className="text-gray-600 dark:text-gray-400">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Order Details */}
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                  <p className="text-gray-900 dark:text-white capitalize">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method</p>
                  <p className="text-gray-900 dark:text-white capitalize">{selectedOrder.payment_method}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{item.menu_item_name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Category: {getCategoryForMenuItem(item.menu_item_name)} • Size: {item.size} • Qty: {item.quantity}
                        </p>
                        {item.extras.length > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Extras: {item.extras.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{formatPrice(item.total_price)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatPrice(item.unit_price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Totals */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">GST</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(selectedOrder.gst_amount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 