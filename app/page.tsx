'use client'

import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import LoginForm from '@/components/auth/LoginForm'
import Header from '@/components/pos/Header'
import CategoryFilter from '@/components/pos/CategoryFilter'
import MenuGrid from '@/components/pos/MenuGrid'
import OrderPanel from '@/components/pos/OrderPanel'
import TableGrid from '@/components/pos/TableGrid'
import Receipt from '@/components/pos/Receipt'
import OrderHistory from '@/components/pos/OrderHistory'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { usePosStore, Order } from '@/lib/store'
import { getSession } from '@/lib/auth'

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState('pos')
  const [showReceipt, setShowReceipt] = useState(false)
  const [showOrderHistory, setShowOrderHistory] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const { 
    isAuthenticated, 
    staff,
    setStaff, 
    loadMenuItems,
    currentView,
    selectedTable,
    setCurrentView,
    initializeTables,
    loadPersistedData
  } = usePosStore()

  // Load persisted data and check session on mount
  useEffect(() => {
    // Apply permanent dark mode
    document.documentElement.classList.add('dark')
    
    // Load persisted store data
    loadPersistedData()
    
    // Initialize tables if not already done
    initializeTables()
    
    // Check for existing session
    const session = getSession()
    if (session?.staff) {
      setStaff(session.staff)
    }

    setIsInitialized(true)
  }, [setStaff, initializeTables, loadPersistedData])

  // Load menu items from Supabase
  useEffect(() => {
    if (isInitialized) {
      loadMenuItems()
    }
  }, [loadMenuItems, isInitialized])

  const handleLoginSuccess = () => {
    // Login successful, component will re-render due to state change
  }

  const handleLogout = () => {
    setStaff(null)
    setCurrentPage('pos')
    setCurrentView('tables')
    // Clear session is handled in the store
  }

  const handleNavigate = (page: 'pos' | 'reports' | 'menu' | 'admin') => {
    setCurrentPage(page)
    if (page === 'pos') {
      setCurrentView('tables')
    }
  }

  // Check if current user is admin
  const isAdmin = staff?.role === 'admin'

  const handlePaymentComplete = (order: Order) => {
    setCompletedOrder(order)
    setShowReceipt(true)
    
    // Auto-navigate back to tables after payment
    setTimeout(() => {
      setCurrentView('tables')
    }, 1000)
  }

  const handleCloseReceipt = () => {
    setShowReceipt(false)
    setCompletedOrder(null)
  }

  const handleShowOrderHistory = () => {
    setShowOrderHistory(true)
  }

  const handleCloseOrderHistory = () => {
    setShowOrderHistory(false)
  }

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading Gloria Jean&apos;s POS...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#ffffff',
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px 16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              style: {
                background: '#065f46',
                color: '#ffffff',
                border: '1px solid #047857',
              },
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              style: {
                background: '#991b1b',
                color: '#ffffff',
                border: '1px solid #dc2626',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </>
    )
  }

  // Show Admin Dashboard for admin users when accessing admin features
  if (isAdmin && (currentPage === 'admin' || currentPage === 'reports' || currentPage === 'menu')) {
    return (
      <>
        <AdminDashboard />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#ffffff',
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px 16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              style: {
                background: '#065f46',
                color: '#ffffff',
                border: '1px solid #047857',
              },
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              style: {
                background: '#991b1b',
                color: '#ffffff',
                border: '1px solid #dc2626',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <Header 
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onShowOrderHistory={handleShowOrderHistory}
      />

      {/* Main Content */}
      {currentPage === 'pos' && (
        <>
          {currentView === 'tables' && <TableGrid />}
          
          {currentView === 'pos' && selectedTable && (
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel - Menu */}
              <div className="flex-1 flex flex-col min-w-0">
                <CategoryFilter />
                <MenuGrid />
              </div>

              {/* Right Panel - Order (Responsive) */}
              <OrderPanel onPaymentComplete={handlePaymentComplete} />
            </div>
          )}
        </>
      )}

      {/* Non-admin users see simplified versions */}
      {!isAdmin && currentPage === 'reports' && (
        <div className="flex-1 p-6">
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Basic Reports</h2>
            <div className="text-center py-12">
              <p className="text-gray-300 mb-4">Limited reporting for cashier role</p>
              <p className="text-sm text-gray-400">
                Contact administrator for detailed analytics and reports.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isAdmin && currentPage === 'menu' && (
        <div className="flex-1 p-6">
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Menu View</h2>
            <div className="text-center py-12">
              <p className="text-gray-300 mb-4">View-only access for cashier role</p>
              <p className="text-sm text-gray-400">
                Contact administrator to modify menu items and prices.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && completedOrder && (
        <Receipt 
          order={completedOrder}
          onClose={handleCloseReceipt}
        />
      )}

      {/* Order History Modal */}
      {showOrderHistory && (
        <OrderHistory 
          onClose={handleCloseOrderHistory}
        />
      )}

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#ffffff',
            border: '1px solid #374151',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          success: {
            style: {
              background: '#065f46',
              color: '#ffffff',
              border: '1px solid #047857',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            style: {
              background: '#991b1b',
              color: '#ffffff',
              border: '1px solid #dc2626',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  )
}
