'use client'

import { LogOut, Users, BarChart3, Settings, Coffee, ArrowLeft } from 'lucide-react'
import { usePosStore } from '@/lib/store'
import { clearSession } from '@/lib/auth'

interface HeaderProps {
  onLogout: () => void
  onNavigate: (page: 'pos' | 'reports' | 'menu' | 'admin') => void
  currentPage: string
}

export default function Header({ onLogout, onNavigate, currentPage }: HeaderProps) {
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

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-xl">
              <Coffee className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Gloria Jean&apos;s POS
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Point of Sale System
              </p>
            </div>
          </div>

          {/* Navigation - only show for admin or when in POS mode */}
          {(isAdmin || currentPage === 'pos') && (
            <nav className="flex items-center gap-2">
              {/* Back to Tables button when viewing a table */}
              {currentView === 'pos' && selectedTable && (
                <button
                  onClick={handleBackToTables}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Tables
                </button>
              )}

              {/* Main Navigation */}
              <button
                onClick={() => onNavigate('pos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'pos'
                    ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Coffee className="h-4 w-4" />
                POS System
              </button>

              {/* Admin Navigation */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => onNavigate('reports')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentPage === 'reports'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Reports
                  </button>

                  <button
                    onClick={() => onNavigate('menu')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentPage === 'menu'
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    Menu
                  </button>

                  <button
                    onClick={() => onNavigate('admin')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentPage === 'admin'
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Admin
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
                      className="flex items-center gap-2 px-4 py-2 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-lg transition-colors font-medium"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Tables
                    </button>
                  )}

                  <button
                    onClick={() => onNavigate('reports')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentPage === 'reports'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Reports
                  </button>

                  <button
                    onClick={() => onNavigate('menu')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentPage === 'menu'
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    Menu
                  </button>
                </>
              )}
            </nav>
          )}
        </div>

        {/* Center Section - Current Context */}
        {currentView === 'pos' && selectedTable && (
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900 px-4 py-2 rounded-lg">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-amber-800 dark:text-amber-200">
              Currently serving Table {selectedTable}
            </span>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Staff Info */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {staff?.email}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {staff?.role === 'admin' ? 'Administrator' : 'Cashier'}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
              {staff?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>



          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Staff Info */}
      <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900 px-3 py-1 rounded-lg">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
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