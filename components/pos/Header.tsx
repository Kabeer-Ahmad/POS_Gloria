'use client'

import { LogOut, Users, BarChart3, Settings, Coffee, ArrowLeft, Clock } from 'lucide-react'
import { usePosStore } from '@/lib/store'
import { clearSession } from '@/lib/auth'

interface HeaderProps {
  onLogout: () => void
  onNavigate: (page: 'pos' | 'reports' | 'menu' | 'admin') => void
  currentPage: string
  onShowOrderHistory?: () => void
}

export default function Header({ onLogout, onNavigate, currentPage, onShowOrderHistory }: HeaderProps) {
  const { 
    staff, 
    currentView, 
    selectedTable, 
    setCurrentView
  } = usePosStore()

  const handleLogout = () => {
    clearSession()
    onLogout()
  }

  const handleBackToTables = () => {
    setCurrentView('tables')
  }

  const isAdmin = staff?.role === 'admin'

  // Admin: Show dashboard-style tabbed navbar
  if (isAdmin) {
    const adminTabs = [
      { key: 'pos', label: 'POS System', icon: Coffee },
      { key: 'reports', label: 'Reports', icon: BarChart3 },
      { key: 'menu', label: 'Menu', icon: Settings },
      { key: 'admin', label: 'Admin', icon: Users }
    ]
    return (
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-1.5 rounded-lg">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Gloria Jean&apos;s POS
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Point of Sale System
              </p>
            </div>
          </div>
          {/* Admin Tab Navigation */}
          <nav className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {adminTabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => onNavigate(key as 'pos' | 'reports' | 'menu' | 'admin')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentPage === key
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors ml-2"
            >
              <LogOut className="h-3 w-3" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </nav>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-1.5 rounded-lg">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Gloria Jean&apos;s POS
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Point of Sale System
              </p>
            </div>
          </div>

          {/* Navigation - only show for admin or when in POS mode */}
          {(isAdmin || currentPage === 'pos') && (
            <nav className="flex items-center gap-1">
              {/* Back to Tables button when viewing a table */}
              {currentView === 'pos' && selectedTable && (
                <button
                  onClick={handleBackToTables}
                  className="flex items-center gap-1 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-sm"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span className="hidden sm:inline">Back to Tables</span>
                </button>
              )}

              {/* Main Navigation */}
              <button
                onClick={() => onNavigate('pos')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors text-sm ${
                  currentPage === 'pos'
                    ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Coffee className="h-3 w-3" />
                <span className="hidden sm:inline">POS System</span>
              </button>

              {/* Admin Navigation */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => onNavigate('reports')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors text-sm ${
                      currentPage === 'reports'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <BarChart3 className="h-3 w-3" />
                    <span className="hidden sm:inline">Reports</span>
                  </button>

                  <button
                    onClick={() => onNavigate('menu')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors text-sm ${
                      currentPage === 'menu'
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Settings className="h-3 w-3" />
                    <span className="hidden sm:inline">Menu</span>
                  </button>

                  <button
                    onClick={() => onNavigate('admin')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors text-sm ${
                      currentPage === 'admin'
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Users className="h-3 w-3" />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                </>
              )}

              {/* Cashier Limited Navigation */}
              {!isAdmin && (
                <>
                  {/* Back to Tables for Cashiers on restricted pages */}
                  {(currentPage === 'reports' || currentPage === 'menu') && (
                    <button
                      onClick={() => onNavigate('pos')}
                      className="flex items-center gap-1 px-3 py-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-md transition-colors font-medium text-sm"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      <span className="hidden sm:inline">Back to Tables</span>
                    </button>
                  )}
                </>
              )}

              {/* Order History Button - Available for all users */}
              {currentPage === 'pos' && onShowOrderHistory && (
                <button
                  onClick={onShowOrderHistory}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-md transition-colors font-medium text-sm"
                >
                  <Clock className="h-3 w-3" />
                  <span className="hidden sm:inline">Order History</span>
                </button>
              )}
            </nav>
          )}
        </div>

        {/* Center Section - Current Context */}
        {currentView === 'pos' && selectedTable && (
          <div className="hidden md:flex items-center gap-2 bg-amber-50 dark:bg-amber-900 px-3 py-1.5 rounded-md">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-amber-800 dark:text-amber-200 text-sm">
              Currently serving Table {selectedTable}
            </span>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Staff Info */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {staff?.email}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {staff?.role === 'admin' ? 'Administrator' : 'Cashier'}
              </p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {staff?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>

          <div className="hidden lg:block h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors text-sm"
          >
            <LogOut className="h-3 w-3" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Staff Info and Table Status */}
      <div className="md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
              {staff?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {staff?.email}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {staff?.role === 'admin' ? 'Administrator' : 'Cashier'}
              </p>
            </div>
          </div>

          {currentView === 'pos' && selectedTable && (
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900 px-2 py-1 rounded-md">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
                Table {selectedTable}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 