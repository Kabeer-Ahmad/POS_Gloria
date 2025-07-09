'use client'

import { useState } from 'react'
import { LogIn, Eye, EyeOff, Coffee } from 'lucide-react'
import { quickLogin } from '@/lib/auth'
import { usePosStore } from '@/lib/store'
import toast from 'react-hot-toast'

interface LoginFormProps {
  onLoginSuccess: () => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [role, setRole] = useState<'admin' | 'cashier'>('cashier')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { setStaff } = usePosStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password) {
      toast.error('Please enter a password')
      return
    }

    setIsLoading(true)

    try {
      const staff = await quickLogin(role, password)
      
      if (staff) {
        setStaff(staff)
        toast.success(`Welcome ${role}!`)
        onLoginSuccess()
      } else {
        toast.error('Invalid password')
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-amber-600 rounded-full p-3">
              <Coffee className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Gloria Jean&apos;s Coffees
          </h1>
          <p className="text-gray-400">Point of Sale System</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Login as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('cashier')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'cashier'
                      ? 'border-amber-500 bg-amber-900 text-white'
                      : 'border-gray-600 hover:border-gray-500 text-white'
                  }`}
                >
                  <div className="font-medium">Cashier</div>
                  <div className="text-sm text-gray-400">Orders & Sales</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'admin'
                      ? 'border-amber-500 bg-amber-900 text-white'
                      : 'border-gray-600 hover:border-gray-500 text-white'
                  }`}
                >
                  <div className="font-medium">Admin</div>
                  <div className="text-sm text-gray-400">Full Access</div>
                </button>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-12"
                  placeholder={`Enter ${role} password`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          Gloria Jean&apos;s Coffees POS v2.1
        </div>
      </div>
    </div>
  )
} 