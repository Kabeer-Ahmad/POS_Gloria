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
import AdminDashboard from '@/components/admin/AdminDashboard'
import { usePosStore, Order } from '@/lib/store'
import { getSession } from '@/lib/auth'

interface MockMenuItem {
  id: string
  name: string
  category: string
  sizes: string[]
  prices: Record<string, number>
  is_active: boolean
}

// Complete menu data from seed
const mockMenuItems: MockMenuItem[] = [
  // ESPRESSO MENU - CLASSICS
  {
    id: '1',
    name: 'Cappuccino / Caffé Latté',
    category: 'Espresso - Classics',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 750, Regular: 795, Large: 900 },
    is_active: true
  },
  {
    id: '2',
    name: 'Caffé Americano',
    category: 'Espresso - Classics',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 550, Regular: 675, Large: 750 },
    is_active: true
  },
  {
    id: '3',
    name: 'Espresso / Ristretto / Macchiato / Piccolo Latté',
    category: 'Espresso - Classics',
    sizes: ['Regular'],
    prices: { Regular: 525 },
    is_active: true
  },

  // ESPRESSO MENU - SPECIALTIES
  {
    id: '4',
    name: 'Caffé Mocha',
    category: 'Espresso - Specialties',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 850, Regular: 925, Large: 1050 },
    is_active: true
  },
  {
    id: '5',
    name: 'Caramel Latté',
    category: 'Espresso - Specialties',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 850, Regular: 925, Large: 1050 },
    is_active: true
  },
  {
    id: '6',
    name: 'Very Vanilla Latté',
    category: 'Espresso - Specialties',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 850, Regular: 925, Large: 1050 },
    is_active: true
  },
  {
    id: '7',
    name: 'Irish Nut Crème',
    category: 'Espresso - Specialties',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 850, Regular: 925, Large: 1050 },
    is_active: true
  },
  {
    id: '8',
    name: 'White Chocolate Mocha',
    category: 'Espresso - Specialties',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 850, Regular: 925, Large: 1050 },
    is_active: true
  },
  {
    id: '9',
    name: 'Mocha Caramelatte',
    category: 'Espresso - Specialties',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 850, Regular: 925, Large: 1050 },
    is_active: true
  },
  {
    id: '10',
    name: 'Chocolate Macadamia Latté',
    category: 'Espresso - Specialties',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 850, Regular: 925, Large: 1050 },
    is_active: true
  },
  {
    id: '11',
    name: 'Crème Brulee Latté',
    category: 'Espresso - Specialties',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 850, Regular: 925, Large: 1050 },
    is_active: true
  },
  {
    id: '12',
    name: 'Hazelnut Latté',
    category: 'Espresso - Specialties',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 850, Regular: 925, Large: 1050 },
    is_active: true
  },
  {
    id: '13',
    name: 'Mocha Truffle Latté',
    category: 'Espresso - Specialties',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 850, Regular: 925, Large: 1050 },
    is_active: true
  },
  {
    id: '14',
    name: 'Minicino / Babycino',
    category: 'Espresso - Specialties',
    sizes: ['Regular'],
    prices: { Regular: 550 },
    is_active: true
  },

  // TEA
  {
    id: '15',
    name: 'Hot Tea (English Breakfast, Green Tea)',
    category: 'Tea',
    sizes: ['All Sizes'],
    prices: { 'All Sizes': 550 },
    is_active: true
  },
  {
    id: '16',
    name: 'Chai Tea Latté',
    category: 'Tea',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 850, Regular: 925, Large: 1050 },
    is_active: true
  },

  // HOT CHOCOLATE
  {
    id: '17',
    name: 'Classic Hot Chocolate',
    category: 'Hot Chocolate',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 875, Regular: 925, Large: 1050 },
    is_active: true
  },
  {
    id: '18',
    name: 'White Hot Chocolate',
    category: 'Hot Chocolate',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 875, Regular: 925, Large: 1050 },
    is_active: true
  },
  {
    id: '19',
    name: 'GJC\'s Creamy Hot Cocoa',
    category: 'Hot Chocolate',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 875, Regular: 925, Large: 1050 },
    is_active: true
  },

  // CHILLERS - ESPRESSO
  {
    id: '20',
    name: 'Very Vanilla Chiller',
    category: 'Chillers - Espresso',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 950, Regular: 1050, Large: 1150 },
    is_active: true
  },
  {
    id: '21',
    name: 'Crème Brule',
    category: 'Chillers - Espresso',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 950, Regular: 1050, Large: 1150 },
    is_active: true
  },
  {
    id: '22',
    name: 'Voltage',
    category: 'Chillers - Espresso',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 950, Regular: 1050, Large: 1150 },
    is_active: true
  },
  {
    id: '23',
    name: 'Mocha Java Voltage',
    category: 'Chillers - Espresso',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 950, Regular: 1050, Large: 1150 },
    is_active: true
  },

  // CHILLERS - MOCHA
  {
    id: '24',
    name: 'Cocoa Loco',
    category: 'Chillers - Mocha',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 950, Regular: 1050, Large: 1150 },
    is_active: true
  },
  {
    id: '25',
    name: 'Cookies \'N Cream',
    category: 'Chillers - Mocha',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 950, Regular: 1050, Large: 1150 },
    is_active: true
  },
  {
    id: '26',
    name: 'Mint Chocolate Bomb',
    category: 'Chillers - Mocha',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 975, Regular: 1050, Large: 1150 },
    is_active: true
  },
  {
    id: '27',
    name: 'Crunchy Cookie Chiller',
    category: 'Chillers - Mocha',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 975, Regular: 1050, Large: 1150 },
    is_active: true
  },

  // CHILLERS - GOURMET ICED
  {
    id: '28',
    name: 'Original Iced Chocolate',
    category: 'Chillers - Gourmet Iced',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 975, Regular: 1050, Large: 1150 },
    is_active: true
  },
  {
    id: '29',
    name: 'Strawberries \'N Cream',
    category: 'Chillers - Gourmet Iced',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 975, Regular: 1050, Large: 1150 },
    is_active: true
  },
  {
    id: '30',
    name: 'Mango Macadamia',
    category: 'Chillers - Gourmet Iced',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 975, Regular: 1050, Large: 1150 },
    is_active: true
  },
  {
    id: '31',
    name: 'Coconut White Chocolate',
    category: 'Chillers - Gourmet Iced',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 975, Regular: 1050, Large: 1150 },
    is_active: true
  },

  // CHILLERS - FRUIT
  {
    id: '32',
    name: 'Mango Chiller',
    category: 'Chillers - Fruit',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 1050, Regular: 1150, Large: 1300 },
    is_active: true
  },
  {
    id: '33',
    name: 'Strawberry Chiller',
    category: 'Chillers - Fruit',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 1050, Regular: 1150, Large: 1300 },
    is_active: true
  },
  {
    id: '34',
    name: 'Mixed Berry Chiller',
    category: 'Chillers - Fruit',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 1050, Regular: 1150, Large: 1300 },
    is_active: true
  },

  // SMOOTHIES
  {
    id: '35',
    name: 'Mango Smoothie',
    category: 'Smoothies',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 1100, Regular: 1250, Large: 1400 },
    is_active: true
  },
  {
    id: '36',
    name: 'Strawberry Smoothie',
    category: 'Smoothies',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 1100, Regular: 1250, Large: 1400 },
    is_active: true
  },
  {
    id: '37',
    name: 'Mixed Berry Smoothie',
    category: 'Smoothies',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 1100, Regular: 1250, Large: 1400 },
    is_active: true
  },

  // OVER ICE
  {
    id: '38',
    name: 'Signature Iced Coffee',
    category: 'Over Ice',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 975, Regular: 1050, Large: 1150 },
    is_active: true
  },
  {
    id: '39',
    name: 'Iced Latté',
    category: 'Over Ice',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 975, Regular: 1050, Large: 1150 },
    is_active: true
  },
  {
    id: '40',
    name: 'Iced Mocha',
    category: 'Over Ice',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 975, Regular: 1050, Large: 1150 },
    is_active: true
  },
  {
    id: '41',
    name: 'Iced Americano',
    category: 'Over Ice',
    sizes: ['Small', 'Regular', 'Large'],
    prices: { Small: 800, Regular: 950, Large: 1050 },
    is_active: true
  },
  {
    id: '42',
    name: 'Italian Soda',
    category: 'Over Ice',
    sizes: ['All Sizes'],
    prices: { 'All Sizes': 850 },
    is_active: true
  },
  {
    id: '43',
    name: 'Iced Tea',
    category: 'Over Ice',
    sizes: ['All Sizes'],
    prices: { 'All Sizes': 675 },
    is_active: true
  },

  // FOOD
  {
    id: '44',
    name: 'The Grande Zinger',
    category: 'Food',
    sizes: ['Regular'],
    prices: { Regular: 700 },
    is_active: true
  },
  {
    id: '45',
    name: 'Sandwich',
    category: 'Food',
    sizes: ['Regular'],
    prices: { Regular: 850 },
    is_active: true
  },
  {
    id: '46',
    name: 'Fries',
    category: 'Food',
    sizes: ['Regular'],
    prices: { Regular: 400 },
    is_active: true
  },
  {
    id: '47',
    name: 'Masala Fries',
    category: 'Food',
    sizes: ['Regular'],
    prices: { Regular: 500 },
    is_active: true
  },
  {
    id: '48',
    name: 'Stuffed Chicken Bread Slice',
    category: 'Food',
    sizes: ['Regular'],
    prices: { Regular: 200 },
    is_active: true
  },
  {
    id: '49',
    name: 'Pizza Slice',
    category: 'Food',
    sizes: ['Regular'],
    prices: { Regular: 300 },
    is_active: true
  },
  {
    id: '50',
    name: 'The Sizzling Fajita Pizza',
    category: 'Food',
    sizes: ['Regular'],
    prices: { Regular: 1200 },
    is_active: true
  },
  {
    id: '51',
    name: 'The Signature Chicken Spaghetti',
    category: 'Food',
    sizes: ['Regular'],
    prices: { Regular: 950 },
    is_active: true
  },
  {
    id: '52',
    name: 'Butter Milk Fries Drum Stick',
    category: 'Food',
    sizes: ['Regular'],
    prices: { Regular: 600 },
    is_active: true
  },

  // DEALS
  {
    id: '53',
    name: 'Cappuccino (small) / Sandwich',
    category: 'Deals',
    sizes: ['Combo'],
    prices: { Combo: 1400 },
    is_active: true
  },
  {
    id: '54',
    name: 'Caffé Latté (small) / Chicken Bread',
    category: 'Deals',
    sizes: ['Combo'],
    prices: { Combo: 1350 },
    is_active: true
  },
  {
    id: '55',
    name: 'Cappuccino (small) / Sandwich & Fries',
    category: 'Deals',
    sizes: ['Combo'],
    prices: { Combo: 1700 },
    is_active: true
  },
  {
    id: '56',
    name: 'Sandwich / Fries & Cold Drink',
    category: 'Deals',
    sizes: ['Combo'],
    prices: { Combo: 1300 },
    is_active: true
  },
  {
    id: '57',
    name: 'Pizza / Cold Drink',
    category: 'Deals',
    sizes: ['Combo'],
    prices: { Combo: 1350 },
    is_active: true
  },
  {
    id: '58',
    name: 'Chicken Bread / Shake',
    category: 'Deals',
    sizes: ['Combo'],
    prices: { Combo: 1200 },
    is_active: true
  },
  {
    id: '59',
    name: 'Spaghetti / (small) Cappuccino',
    category: 'Deals',
    sizes: ['Combo'],
    prices: { Combo: 1500 },
    is_active: true
  },
  {
    id: '60',
    name: 'Spaghetti / Shake',
    category: 'Deals',
    sizes: ['Combo'],
    prices: { Combo: 1500 },
    is_active: true
  },
  {
    id: '61',
    name: 'The Classic Shami / Melt Cold Drinks',
    category: 'Deals',
    sizes: ['Combo'],
    prices: { Combo: 650 },
    is_active: true
  },

  // EXTRAS
  {
    id: '62',
    name: 'Espresso Shot',
    category: 'Extras',
    sizes: ['Any Size'],
    prices: { 'Any Size': 350 },
    is_active: true
  },
  {
    id: '63',
    name: 'Flavour Syrup',
    category: 'Extras',
    sizes: ['Any Size'],
    prices: { 'Any Size': 350 },
    is_active: true
  },
  {
    id: '64',
    name: 'Whipped Cream',
    category: 'Extras',
    sizes: ['Any Size'],
    prices: { 'Any Size': 350 },
    is_active: true
  }
]

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState('pos')
  const [showReceipt, setShowReceipt] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const { 
    isAuthenticated, 
    staff,
    setStaff, 
    setMenuItems,
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

  // Load menu items
  useEffect(() => {
    if (isInitialized) {
      setMenuItems(mockMenuItems)
    }
  }, [setMenuItems, isInitialized])

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
        <Toaster position="top-right" />
      </>
    )
  }

  // Show Admin Dashboard for admin users when accessing admin features
  if (isAdmin && (currentPage === 'admin' || currentPage === 'reports' || currentPage === 'menu')) {
    return (
      <>
        <AdminDashboard />
        <Toaster position="top-right" />
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

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  )
}
