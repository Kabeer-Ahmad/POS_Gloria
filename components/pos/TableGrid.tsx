'use client'

import { usePosStore, Table } from '@/lib/store'
import { Users, Clock, ShoppingBag } from 'lucide-react'
import { useEffect } from 'react'

export default function TableGrid() {
  const { tables, selectTable, initializeTables } = usePosStore()

  useEffect(() => {
    if (tables.length === 0) {
      initializeTables()
    }
  }, [tables.length, initializeTables])

  const getTableStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'empty':
        return 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
      case 'occupied':
        return 'bg-gray-900 dark:bg-gray-800 border-blue-500 text-white hover:border-blue-400'
      case 'held':
        return 'bg-gray-900 dark:bg-gray-800 border-red-500 text-white hover:border-red-400'
      default:
        return 'bg-white border-gray-200 text-gray-700'
    }
  }

  const getTableStatusIcon = (status: Table['status']) => {
    switch (status) {
      case 'empty':
        return <Users className="h-6 w-6 text-gray-400" />
      case 'occupied':
        return <ShoppingBag className="h-6 w-6 text-blue-400" />
      case 'held':
        return <Clock className="h-6 w-6 text-red-400" />
      default:
        return <Users className="h-6 w-6 text-gray-400" />
    }
  }

  const getStatusBadge = (status: Table['status']) => {
    switch (status) {
      case 'empty':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            Available
          </span>
        )
      case 'occupied':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full animate-pulse">
            Occupied
          </span>
        )
      case 'held':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full animate-pulse">
            On Hold
          </span>
        )
      default:
        return null
    }
  }

  const formatPrice = (price: number) => {
    return `Rs. ${price.toFixed(2)}`
  }

  const getOrderSummary = (table: Table) => {
    if (!table.order || table.order.items.length === 0) return null
    
    const itemCount = table.order.items.reduce((sum, item) => sum + item.quantity, 0)
    const total = table.order.total || 0
    
    return { itemCount, total }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
              <div className="p-4 lg:p-6 border-b border-gray-600 bg-gray-800/90 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4 animate-slideDown">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Gloria Jean&apos;s Coffees
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Table Management System</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-300">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-200 rounded-full animate-pulse"></div>
              <span className="text-gray-600 dark:text-gray-300">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-200 rounded-full animate-pulse"></div>
              <span className="text-gray-600 dark:text-gray-300">On Hold</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 animate-slideDown" style={{ animationDelay: '100ms' }}>
          <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-3 border-2 border-green-500">
            <div className="text-green-400 text-sm font-medium">Available</div>
            <div className="text-white text-xl font-bold">
              {tables.filter(t => t.status === 'empty').length}
            </div>
          </div>
          <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-3 border-2 border-blue-500">
            <div className="text-blue-400 text-sm font-medium">Occupied</div>
            <div className="text-white text-xl font-bold">
              {tables.filter(t => t.status === 'occupied').length}
            </div>
          </div>
          <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-3 border-2 border-red-500">
            <div className="text-red-400 text-sm font-medium">On Hold</div>
            <div className="text-white text-xl font-bold">
              {tables.filter(t => t.status === 'held').length}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="flex-1 overflow-auto p-4 lg:p-6 cart-scroll">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
          {tables.map((table, index) => {
            const orderSummary = getOrderSummary(table)
            
            return (
              <div
                key={table.id}
                onClick={() => selectTable(table.id)}
                className={`
                  relative rounded-xl border-2 p-4 lg:p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg card-hover animate-slideInUp
                  ${getTableStatusColor(table.status)}
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(table.status)}
                </div>

                {/* Table Icon */}
                <div className="flex items-center justify-center mb-3">
                  {getTableStatusIcon(table.status)}
                </div>

                {/* Table Number */}
                <div className="text-center mb-3">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">
                    Table {table.id}
                  </h3>
                  {table.lastUpdated && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Updated: {new Date(table.lastUpdated).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  )}
                </div>

                {/* Order Summary */}
                {orderSummary && (
                  <div className={`space-y-2 pt-3 ${
                    table.status === 'empty' 
                      ? 'border-t border-gray-200' 
                      : 'border-t border-gray-600'
                  }`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`${
                        table.status === 'empty'
                          ? 'text-gray-600 dark:text-gray-300'
                          : 'text-gray-300'
                      }`}>Items:</span>
                      <span className={`font-medium ${
                        table.status === 'empty'
                          ? 'text-gray-900 dark:text-gray-100'
                          : 'text-white'
                      }`}>{orderSummary.itemCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`${
                        table.status === 'empty'
                          ? 'text-gray-600 dark:text-gray-300'
                          : 'text-gray-300'
                      }`}>Total:</span>
                      <span className="font-bold text-amber-400">
                        {formatPrice(orderSummary.total)}
                      </span>
                    </div>
                    {table.order?.status === 'held' && (
                      <div className="text-xs text-red-400 font-medium text-center mt-2 animate-pulse">
                        Order on hold
                      </div>
                    )}
                  </div>
                )}

                {/* Empty State */}
                {!orderSummary && table.status === 'empty' && (
                  <div className="text-center text-gray-400 text-sm">
                    Tap to start order
                  </div>
                )}

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {tables.length === 0 && (
          <div className="text-center py-12 animate-fadeIn">
            <div className="text-gray-400 mb-4">
              <Users className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Initializing Tables...
            </h3>
            <p className="text-gray-500">Please wait while we set up the tables</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-600 bg-gray-800/90 backdrop-blur-sm">
        <div className="text-center text-sm text-gray-600 dark:text-gray-300 animate-slideDown">
          <p>Select a table to start taking orders</p>
          <p className="text-xs mt-1">
            Powered by Gloria Jean&apos;s POS System
          </p>
        </div>
      </div>
    </div>
  )
} 