'use client'

import { usePosStore } from '@/lib/store'

export default function CategoryFilter() {
  const { categories, selectedCategory, setSelectedCategory } = usePosStore()

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-4">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <span className="text-sm font-medium text-white whitespace-nowrap mr-2">
          Categories:
        </span>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-amber-600 text-white'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
} 