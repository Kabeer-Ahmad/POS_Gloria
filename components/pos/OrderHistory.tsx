'use client'

import { useState, useEffect } from 'react'
import { 
  Eye, 
  Printer, 
  Search, 
  Filter, 
  DollarSign,
  CreditCard,
  ShoppingBag,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import { Order } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface OrderHistoryProps {
  onClose: () => void
}

interface CompletedOrder extends Order {
  completedAt: string
}

interface SupabaseOrder {
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
  order_items?: SupabaseOrderItem[]
}

interface SupabaseOrderItem {
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

export default function OrderHistory({ onClose }: OrderHistoryProps) {
  const [orders, setOrders] = useState<CompletedOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<CompletedOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'card'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const ordersPerPage = 10

  useEffect(() => {
    loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, searchQuery, dateFilter, paymentFilter])

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      // Try to fetch from Supabase first
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { data: supabaseOrders, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .eq('status', 'paid')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching orders from Supabase:', error)
          toast.error('Failed to load orders from database')
          // Fall back to localStorage
          loadFromLocalStorage()
          return
        }

        // Convert Supabase data to our format
        const convertedOrders: CompletedOrder[] = (supabaseOrders || []).map((order: SupabaseOrder) => ({
          id: order.id,
          orderNumber: order.order_number,
          items: (order.order_items || []).map((item: SupabaseOrderItem) => ({
            id: item.id,
            menuItem: {
              id: item.menu_item_id,
              name: item.menu_item_name,
              category: 'Unknown', // We don't have category in order_items
              sizes: [item.size],
              prices: { [item.size]: item.unit_price },
              is_active: true
            },
            size: item.size,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            extras: item.extras || [],
            extrasPrice: item.extras_cost || 0,
            totalPrice: item.total_price
          })),
          subtotal: order.subtotal,
          gstAmount: order.gst_amount,
          total: order.total,
          status: order.status as 'draft' | 'held' | 'paid',
          paymentMethod: order.payment_method,
          staffId: order.staff_id || 'unknown',
          tableId: 0, // We don't have table_id in the current schema
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          completedAt: order.created_at // Use created_at as completed_at
        }))

        setOrders(convertedOrders)
        console.log('Loaded orders from Supabase:', convertedOrders.length)
      } else {
        // Fall back to localStorage if Supabase is not configured
        loadFromLocalStorage()
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load order history')
      // Fall back to localStorage
      loadFromLocalStorage()
    } finally {
      setIsLoading(false)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const existingOrders = localStorage.getItem('completed_orders')
      const loadedOrders = existingOrders ? JSON.parse(existingOrders) : []
      setOrders(loadedOrders)
      console.log('Loaded orders from localStorage:', loadedOrders.length)
    } catch (error) {
      console.error('Error loading orders from localStorage:', error)
      setOrders([])
    }
  }

  const applyFilters = () => {
    let filtered = [...orders]

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.completedAt)
        
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
      filtered = filtered.filter(order => order.paymentMethod === paymentFilter)
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => 
          item.menuItem.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    setFilteredOrders(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setSearchQuery('')
    setDateFilter('all')
    setPaymentFilter('all')
  }

  const formatPrice = (price: number) => `Rs. ${price.toFixed(2)}`

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getPaymentIcon = (method: 'cash' | 'card') => {
    return method === 'cash' ? <DollarSign className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />
  }

  const getPaymentColor = (method: 'cash' | 'card') => {
    return method === 'cash' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }

  const handlePrintOrder = (order: CompletedOrder) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const billContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reprint - Order ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .bill-details { margin-bottom: 20px; }
            .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items th, .items td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .items th { background-color: #f8f9fa; }
            .total-section { margin-top: 20px; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total-final { font-weight: bold; font-size: 1.2em; border-top: 2px solid #000; padding-top: 10px; }
            .reprint-notice { text-align: center; color: #666; font-style: italic; margin-top: 10px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Gloria Jean&#39;s Coffees</h1>
            <p>Point of Sale System</p>
            <p class="reprint-notice">REPRINT - Original: ${formatDate(order.completedAt)}</p>
          </div>
          
          <div class="bill-details">
            <p><strong>Table:</strong> ${order.tableId}</p>
            <p><strong>Order #:</strong> ${order.orderNumber}</p>
            <p><strong>Date:</strong> ${new Date(order.completedAt).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(order.completedAt).toLocaleTimeString()}</p>
            <p><strong>Payment:</strong> ${order.paymentMethod?.toUpperCase()}</p>
          </div>

          <table class="items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>
                    ${item.menuItem.name}
                    ${item.extras.length > 0 ? `<br><small>+ ${item.extras.join(', ')}</small>` : ''}
                  </td>
                  <td>${item.size}</td>
                  <td>${item.quantity}</td>
                  <td>Rs. ${item.unitPrice + item.extrasPrice}</td>
                  <td>Rs. ${item.totalPrice}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatPrice(order.subtotal)}</span>
            </div>
            <div class="total-row">
              <span>GST (${order.paymentMethod === 'cash' ? '16%' : '5%'}):</span>
              <span>${formatPrice(order.gstAmount)}</span>
            </div>
            <div class="total-row total-final">
              <span>Total:</span>
              <span>${formatPrice(order.total)}</span>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; color: #666;">
            <p>Thank you for your order!</p>
            <p>Reprinted on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(billContent)
    printWindow.document.close()
    printWindow.print()
    toast.success('Printing order receipt...')
  }

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  )

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-6xl w-full h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order History</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredOrders.length} orders found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadOrders}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'cash' | 'card')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="all">All Payments</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {selectedOrder ? (
            /* Order Details View */
            <div className="h-full overflow-y-auto p-6">
              {/* Back Button */}
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Orders
              </button>

              {/* Order Header */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order Number</p>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Table</p>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedOrder.tableId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                    <div className="flex items-center gap-2">
                      {getPaymentIcon(selectedOrder.paymentMethod || 'cash')}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {selectedOrder.paymentMethod?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {formatDate(selectedOrder.completedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Items</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Item</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Size</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Qty</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Unit Price</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900 dark:text-white">{item.menuItem.name}</p>
                            {item.extras.length > 0 && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                + {item.extras.join(', ')}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{item.size}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{item.quantity}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {formatPrice(item.unitPrice + item.extrasPrice)}
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                            {formatPrice(item.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Subtotal</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(selectedOrder.subtotal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">GST</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(selectedOrder.gstAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {formatPrice(selectedOrder.total)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => handlePrintOrder(selectedOrder)}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  Reprint Receipt
                </button>
              </div>
            </div>
          ) : (
            /* Orders List View */
            <div className="h-full overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading orders...</p>
                  </div>
                </div>
              ) : paginatedOrders.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No orders found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Orders List */}
                  <div className="space-y-4">
                    {paginatedOrders.map((order) => (
                      <div
                        key={order.orderNumber}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <h3 className="font-bold text-gray-900 dark:text-white">
                                Order #{order.orderNumber}
                              </h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getPaymentColor(order.paymentMethod || 'cash')}`}>
                                {getPaymentIcon(order.paymentMethod || 'cash')}
                                {order.paymentMethod?.toUpperCase()}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Table:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">{order.tableId}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Items:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">{order.items.length}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                                <span className="ml-2 font-bold text-gray-900 dark:text-white">{formatPrice(order.total)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{formatDate(order.completedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              Details
                            </button>
                            <button
                              onClick={() => handlePrintOrder(order)}
                              className="flex items-center gap-2 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                            >
                              <Printer className="h-4 w-4" />
                              Reprint
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </button>
                        <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 