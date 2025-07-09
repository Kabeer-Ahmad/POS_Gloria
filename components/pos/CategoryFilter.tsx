'use client'

import { usePosStore } from '@/lib/store'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'

export default function CategoryFilter() {
  const { categories, selectedCategory, setSelectedCategory } = usePosStore()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Manual category sorting: coffees first, then food, bakery, beverages
  const sortCategories = (cats: string[]) => {
    const categoryOrder = [
      'All',
      // Coffee categories (should come first)
      'Espresso - Classics',
      'Espresso - Specialties', 
      'Tea',
      'Hot Chocolate',
      'Chillers - Espresso',
      'Chillers - Mocha',
      'Chillers - Gourmet Iced',
      'Chillers - Fruit',
      'Smoothies',
      'Over Ice',
      // Food categories
      'House Signatures',
      'Pasta Station', 
      'Snacks',
      'Gloria\'s Crave Combo',
      // Bakery categories
      'Warm & Gooey',
      'Gloria\'s Signature Cakes',
      // Beverages (should come last)
      'Beverages',
      'Extras'
    ]

    return cats.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a)
      const bIndex = categoryOrder.indexOf(b)
      
      // If both categories are in our order list, sort by that order
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex
      }
      
      // If only one is in our order list, prioritize it
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      
      // If neither is in our order list, sort alphabetically
      return a.localeCompare(b)
    })
  }

  const sortedCategories = sortCategories([...categories])

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-white">
          Categories:
        </span>
      </div>
      
      {/* Enhanced Slider with Navigation */}
      <div className="relative group">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white p-1.5 rounded-r-lg shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white p-1.5 rounded-l-lg shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sortedCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                selectedCategory === category
                  ? 'bg-amber-600 text-white shadow-lg scale-105'
                  : 'bg-gray-800 text-white hover:bg-gray-700 hover:scale-102'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 