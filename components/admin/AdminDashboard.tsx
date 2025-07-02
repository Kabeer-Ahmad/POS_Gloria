'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, DollarSign, ShoppingCart, TrendingUp, 
  ArrowLeft, Clock, Package, Plus, Edit, Trash2, X
} from 'lucide-react'
import { usePosStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import Reports from './Reports'
import SummaryExport from './SummaryExport'
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

export default function AdminDashboard() {
  const { staff, menuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability } = usePosStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'menu' | 'summary'>('overview')
  const [orders, setOrders] = useState<OrderData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Menu management states
  const [showAddItem, setShowAddItem] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    category: 'Espresso Classics',
    sizes: ['Regular'],
    prices: { Regular: 0 },
    description: '',
    is_active: true
  })

  useEffect(() => {
    loadOrderData()
  }, [])

  const loadOrderData = async () => {
    setIsLoading(true)
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        toast.error('Failed to load orders from database')
        return
      }

      setOrders(ordersData || [])
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart },
    ...(staff?.role === 'admin' ? [
      { key: 'orders', label: 'Orders & Reports', icon: TrendingUp },
      { key: 'menu', label: 'Menu Management', icon: Package },
      { key: 'summary', label: 'Summary & Export', icon: DollarSign }
    ] : [])
  ]

  // Calculate dashboard stats from real orders
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at)
    const today = new Date()
    return orderDate.toDateString() === today.toDateString()
  })

  const totalOrders = orders.length
  const todayOrdersCount = todayOrders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  
  const cashOrders = orders.filter(o => o.payment_method === 'cash').length
  const cardOrders = orders.filter(o => o.payment_method === 'card').length

  const recentOrders = orders.slice(0, 5) // Show last 5 orders

  // Menu management functions
  const categories = [
    'Espresso Classics', 'Espresso - Specialties', 'Tea', 'Hot Chocolate',
    'Chillers - Espresso', 'Chillers - Mocha', 'Chillers - Gourmet Iced', 'Chillers - Fruit',
    'Smoothies', 'Over Ice', 'Food', 'Deals', 'Extras'
  ]

  const handleAddItem = () => {
    if (!newItem.name || !newItem.prices?.Regular || !newItem.category) {
      toast.error('Please fill in all required fields')
      return
    }

    const item: MenuItem = {
      id: Date.now().toString(),
      name: newItem.name,
      category: newItem.category,
      sizes: newItem.sizes || ['Regular'],
      prices: newItem.prices,
      description: newItem.description || '',
      is_active: newItem.is_active ?? true
    }

    addMenuItem(item)
    setNewItem({
      name: '',
      category: 'Espresso Classics',
      sizes: ['Regular'],
      prices: { Regular: 0 },
      description: '',
      is_active: true
    })
    setShowAddItem(false)
    toast.success('Menu item added successfully!')
  }

  const handleEditItem = (item: MenuItem) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      category: item.category,
      sizes: item.sizes,
      prices: item.prices,
      description: item.description || '',
      is_active: item.is_active
    })
  }

  const handleUpdateItem = () => {
    if (!editingItem || !editingItem.name || !editingItem.prices.Regular) {
      toast.error('Please fill in all required fields')
      return
    }

    updateMenuItem(editingItem.id, editingItem)
    setEditingItem(null)
    toast.success('Menu item updated successfully!')
  }

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      deleteMenuItem(id)
      toast.success('Menu item deleted successfully!')
    }
  }

  const handleToggleAvailability = (id: string) => {
    toggleItemAvailability(id)
    toast.success('Item availability updated!')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {staff?.email}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {tabs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as 'overview' | 'orders' | 'menu' | 'summary')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === key
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-white dark:text-white hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to POS
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
                    <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">Rs. {totalRevenue.toFixed(0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3">
                    <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Today&apos;s Orders</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayOrdersCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-100 dark:bg-amber-900 rounded-lg p-3">
                    <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">Rs. {avgOrderValue.toFixed(0)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Cash Orders</span>
                    <span className="font-bold text-gray-900 dark:text-white">{cashOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Card Orders</span>
                    <span className="font-bold text-gray-900 dark:text-white">{cardOrders}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today&apos;s Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Orders Today</span>
                    <span className="font-bold text-gray-900 dark:text-white">{todayOrdersCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Revenue Today</span>
                    <span className="font-bold text-gray-900 dark:text-white">Rs. {todayRevenue.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
                <button
                  onClick={loadOrderData}
                  className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  Refresh
                </button>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Loading orders...</p>
                </div>
              ) : recentOrders.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No orders found</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 dark:bg-green-900 rounded-full p-2">
                          <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{order.order_number}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(order.created_at).toLocaleString()} • {order.order_items?.length || 0} items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">Rs. {order.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{order.payment_method}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders & Reports Tab */}
        {activeTab === 'orders' && (
          <Reports />
        )}

        {/* Menu Management Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Menu Management</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your restaurant menu items</p>
              </div>
              <button
                onClick={() => setShowAddItem(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add New Item
              </button>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{item.category}</p>
                      {item.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.description}</p>
                      )}
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        Rs. {Object.values(item.prices)[0] || 0}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        item.is_active ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className={`text-sm font-medium ${
                        item.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {item.is_active ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAvailability(item.id)}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors font-medium ${
                        item.is_active
                          ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                          : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                      }`}
                    >
                      {item.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleEditItem(item)}
                      className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary & Export Tab */}
        {activeTab === 'summary' && (
          <SummaryExport />
        )}
      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Menu Item</h3>
              <button
                onClick={() => setShowAddItem(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (Rs.) *
                </label>
                <input
                  type="number"
                  value={newItem.prices?.Regular || 0}
                  onChange={(e) => setNewItem({ ...newItem, prices: { Regular: Number(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newItem.is_active}
                  onChange={(e) => setNewItem({ ...newItem, is_active: e.target.checked })}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Available for sale
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddItem(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Menu Item</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (Rs.) *
                </label>
                <input
                  type="number"
                  value={editingItem.prices.Regular || 0}
                  onChange={(e) => setEditingItem({ 
                    ...editingItem, 
                    prices: { ...editingItem.prices, Regular: Number(e.target.value) } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingItem.is_active}
                  onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Available for sale
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateItem}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 