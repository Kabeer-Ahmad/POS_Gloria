'use client'

import { usePosStore, MenuItem, CartItem, generateCartItemId } from '@/lib/store'
import { useState } from 'react'
import { Plus, Star } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MenuGrid() {
  const { selectedTable, selectedCategory, menuItems, addToTableCart } = usePosStore()
  const [selectedSize, setSelectedSize] = useState<{ [key: string]: string }>({})
  const [selectedExtras, setSelectedExtras] = useState<{ [key: string]: string[] }>({})
  
  // Filter menu items by category
  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory)

  const handleAddToTable = (item: MenuItem) => {
    if (!selectedTable) {
      toast.error('Please select a table first')
      return
    }

    const size = selectedSize[item.id] || Object.keys(item.prices)[0]
    const extras = selectedExtras[item.id] || []
    
    // Calculate prices
    const unitPrice = item.prices[size] || 0
    const extrasPrice = extras.length * 350 // 350 per extra
    const totalPrice = unitPrice + extrasPrice

    // Create cart item
    const cartItem: CartItem = {
      id: generateCartItemId(),
      menuItem: item,
      size,
      quantity: 1,
      unitPrice,
      extras,
      extrasPrice,
      totalPrice
    }
    
    addToTableCart(selectedTable, cartItem)
    toast.success(`${item.name} (${size}) added to Table ${selectedTable}`, {
      duration: 2000,
      style: {
        background: '#10b981',
        color: 'white',
      },
    })
  }

  const toggleExtra = (itemId: string, extra: string) => {
    setSelectedExtras(prev => ({
      ...prev,
      [itemId]: prev[itemId]?.includes(extra)
        ? prev[itemId].filter(e => e !== extra)
        : [...(prev[itemId] || []), extra]
    }))
  }

  const formatPrice = (price: number) => {
    return `Rs. ${price.toFixed(2)}`
  }

  // Available extras for all items
  const availableExtras = ['Espresso Shot', 'Flavour Syrup', 'Whipped Cream']

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* Category Header */}
      <div className="p-4 lg:p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
        <h2 className="text-xl lg:text-2xl font-bold text-white animate-slideDown">
          {selectedCategory || 'All Items'}
        </h2>
        <p className="text-sm text-gray-300 mt-1 animate-slideDown" style={{ animationDelay: '100ms' }}>
          {filteredItems.length} items available
        </p>
      </div>

      {/* Menu Items Grid */}
      <div className="flex-1 overflow-auto p-4 lg:p-6 cart-scroll">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 animate-fadeIn">
            <div className="text-gray-500 mb-4">
              <Star className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No items found</h3>
            <p className="text-gray-400">Select a different category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
            {filteredItems.map((item: MenuItem, index: number) => (
              <div
                key={item.id}
                className="menu-item-container bg-gray-800 rounded-xl border border-gray-700 p-4 lg:p-6 menu-item-hover shadow-sm hover:shadow-lg transition-all duration-300 animate-slideInUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Item Header */}
                <div className="mb-4">
                  <h3 className="font-semibold text-white text-base lg:text-lg mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Size Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-2">
                    Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(item.prices).map(([size, price]) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(prev => ({ ...prev, [item.id]: size }))}
                        className={`p-2 lg:p-3 rounded-lg border-2 text-sm transition-all transform hover:scale-105 ${
                          (selectedSize[item.id] || Object.keys(item.prices)[0]) === size
                            ? 'border-amber-500 bg-amber-900 text-white shadow-md'
                            : 'border-gray-600 hover:border-gray-500 text-white bg-gray-700'
                        }`}
                      >
                        <div className="font-medium">{size}</div>
                        <div className="text-xs text-gray-300">{formatPrice(price)}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Extras Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-2">
                    Extras (Rs. 350 each)
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {availableExtras.map((extra: string) => (
                      <button
                        key={extra}
                        onClick={() => toggleExtra(item.id, extra)}
                        className={`p-2 rounded-lg border-2 text-sm transition-all transform hover:scale-105 ${
                          selectedExtras[item.id]?.includes(extra)
                            ? 'border-green-500 bg-green-900 text-white shadow-md'
                            : 'border-gray-600 hover:border-gray-500 text-white bg-gray-700'
                        }`}
                      >
                        {extra}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Display */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Price:</span>
                    <span className="text-lg font-bold text-amber-400">
                      {formatPrice(
                        item.prices[selectedSize[item.id] || Object.keys(item.prices)[0]] +
                        (selectedExtras[item.id]?.length || 0) * 350
                      )}
                    </span>
                  </div>
                  {selectedExtras[item.id]?.length > 0 && (
                    <div className="text-xs text-gray-400 mt-1">
                      Includes {selectedExtras[item.id].length} extra(s)
                    </div>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToTable(item)}
                  disabled={!selectedTable}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-md ${
                    selectedTable
                      ? 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg active:scale-95'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  {selectedTable ? `Add to Table ${selectedTable}` : 'Select Table First'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 