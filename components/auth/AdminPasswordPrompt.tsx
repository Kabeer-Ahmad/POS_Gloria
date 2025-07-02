'use client'

import { useState } from 'react'
import { Shield, Eye, EyeOff, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminPasswordPromptProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  action: string
}

export default function AdminPasswordPrompt({ 
  isOpen, 
  onClose, 
  onSuccess, 
  action 
}: AdminPasswordPromptProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Check against admin password
    if (password === '7890') {
      toast.success('Admin access granted')
      onSuccess()
      onClose()
      setPassword('')
    } else {
      toast.error('Invalid admin password')
    }

    setIsLoading(false)
  }

  const handleClose = () => {
    setPassword('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 border border-gray-700">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-900 rounded-lg p-2">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Access Required</h2>
                <p className="text-sm text-gray-300">Enter admin password to continue</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Action Description */}
          <div className="mb-6 p-4 bg-amber-900 border border-amber-700 rounded-lg">
            <p className="text-amber-200 font-medium">
              Admin permission required for: <span className="font-bold">{action}</span>
            </p>
            <p className="text-amber-300 text-sm mt-1">
              This action is restricted to administrators only.
            </p>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-12"
                  placeholder="Enter admin password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !password}
              >
                {isLoading ? 'Verifying...' : 'Authorize'}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-300">
              <strong>Security Note:</strong> Admin password is required for sensitive operations 
              like deleting items, modifying prices, or accessing restricted features.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 