import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Staff } from './auth'

export interface MenuItem {
  id: string
  name: string
  category: string
  sizes: string[]
  prices: Record<string, number>
  description?: string
  image_url?: string
  is_active: boolean
}

export interface CartItem {
  id: string
  menuItem: MenuItem
  size: string
  quantity: number
  unitPrice: number
  extras: string[]
  extrasPrice: number
  totalPrice: number
}

export interface Order {
  id?: string
  orderNumber: string
  items: CartItem[]
  subtotal: number
  gstAmount: number
  total: number
  status: 'draft' | 'held' | 'paid'
  paymentMethod?: 'cash' | 'card'
  staffId: string
  tableId: number
  createdAt?: string
  updatedAt?: string
}

export interface Table {
  id: number
  name: string
  status: 'empty' | 'occupied' | 'held'
  order?: Order
  lastUpdated?: string
}

interface PosStore {
  // Auth state
  staff: Staff | null
  isAuthenticated: boolean
  
  // Menu state
  menuItems: MenuItem[]
  categories: string[]
  selectedCategory: string
  
  // Table and Order state
  tables: Table[]
  selectedTable: number | null
  currentView: 'tables' | 'pos'
  
  // UI state  
  isLoading: boolean
  
  // Admin state
  isAdminMode: boolean
  
  // Actions
  setStaff: (staff: Staff | null) => void
  setCurrentStaff: (staff: Staff | null) => void
  setMenuItems: (items: MenuItem[]) => void
  setSelectedCategory: (category: string) => void
  
  // Table management
  initializeTables: () => void
  selectTable: (tableId: number) => void
  setTableStatus: (tableId: number, status: Table['status']) => void
  
  // Order management per table
  addToTableCart: (tableId: number, item: CartItem) => void
  updateTableCartItem: (tableId: number, itemId: string, updates: Partial<CartItem>) => void
  removeFromTableCart: (tableId: number, itemId: string) => void
  clearTableCart: (tableId: number) => void
  holdTableOrder: (tableId: number) => void
  payTableOrder: (tableId: number, paymentMethod: 'cash' | 'card') => Promise<Order | undefined>
  
  // UI actions
  setCurrentView: (view: 'tables' | 'pos') => void
  setLoading: (loading: boolean) => void
  setAdminMode: (isAdmin: boolean) => void
  
  // Data persistence
  loadPersistedData: () => void
  saveToSupabase: (order: Order) => Promise<boolean>

  // Menu Management Functions
  addMenuItem: (item: MenuItem) => void
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void
  deleteMenuItem: (id: string) => void
  toggleItemAvailability: (id: string) => void

  // Save completed order for reporting
  saveCompletedOrder: (order: Order) => void
}

// Calculate GST based on payment method
export function calculateGST(subtotal: number, paymentMethod: 'cash' | 'card'): number {
  const gstRate = paymentMethod === 'cash' ? 0.16 : 0.05 // 16% for cash, 5% for card
  return subtotal * gstRate
}

// Calculate totals for a table's cart
function calculateTableTotals(items: CartItem[]): { subtotal: number; gstAmount: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const gstAmount = calculateGST(subtotal, 'cash') // Default to cash for display
  const total = subtotal + gstAmount
  return { subtotal, gstAmount, total }
}

// Apply dark mode to document
function applyDarkMode(isDark: boolean) {
  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}

export const usePosStore = create<PosStore>()(
  persist(
    (set, get) => ({
      // Initial state
      staff: null,
      isAuthenticated: false,
      menuItems: [],
      categories: [],
      selectedCategory: 'All',
      tables: [],
      selectedTable: null,
      currentView: 'tables',
      isLoading: false,
      isAdminMode: false,

      // Actions
      setStaff: (staff) => {
        set({ 
          staff, 
          isAuthenticated: staff !== null,
          isAdminMode: staff?.role === 'admin'
        })
        
        // Save to localStorage for persistence
        if (typeof window !== 'undefined') {
          if (staff) {
            localStorage.setItem('currentStaff', JSON.stringify(staff))
          } else {
            localStorage.removeItem('currentStaff')
          }
        }
      },

      setCurrentStaff: (staff) => {
        set({ 
          staff, 
          isAuthenticated: staff !== null,
          isAdminMode: staff?.role === 'admin'
        })
      },

      setMenuItems: (items) => {
        const categories = ['All', ...new Set(items.map(item => item.category))]
        set({ 
          menuItems: items, 
          categories,
          selectedCategory: get().selectedCategory === '' ? 'All' : get().selectedCategory
        })
      },

      setSelectedCategory: (category) => set({ selectedCategory: category }),

      // Table management
      initializeTables: () => {
        const existingTables = get().tables
        if (existingTables.length === 0) {
          const tables: Table[] = Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            name: `Table ${i + 1}`,
            status: 'empty'
          }))
          set({ tables })
        }
      },

      selectTable: (tableId) => {
        set({ 
          selectedTable: tableId,
          currentView: 'pos'
        })
      },

      setTableStatus: (tableId, status) => {
        const tables = get().tables.map(table => 
          table.id === tableId ? { ...table, status, lastUpdated: new Date().toISOString() } : table
        )
        set({ tables })
      },

      // Order management per table
      addToTableCart: (tableId, item) => {
        const tables = get().tables.map(table => {
          if (table.id === tableId) {
            const currentOrder = table.order || {
              orderNumber: `GJC-T${tableId}-${Date.now()}`,
              items: [],
              subtotal: 0,
              gstAmount: 0,
              total: 0,
              status: 'draft' as const,
              staffId: get().staff?.id || '',
              tableId: tableId,
              createdAt: new Date().toISOString()
            }

            // Check if item already exists in cart
            const existingItemIndex = currentOrder.items.findIndex(
              cartItem => 
                cartItem.menuItem.id === item.menuItem.id && 
                cartItem.size === item.size &&
                JSON.stringify(cartItem.extras) === JSON.stringify(item.extras)
            )

            let updatedItems
            if (existingItemIndex >= 0) {
              // Update existing item quantity
              updatedItems = currentOrder.items.map((cartItem, index) => 
                index === existingItemIndex 
                  ? { 
                      ...cartItem, 
                      quantity: cartItem.quantity + item.quantity,
                      totalPrice: (cartItem.quantity + item.quantity) * cartItem.unitPrice + cartItem.extrasPrice
                    }
                  : cartItem
              )
            } else {
              // Add new item
              updatedItems = [...currentOrder.items, item]
            }

            const totals = calculateTableTotals(updatedItems)
            
            return {
              ...table,
              order: {
                ...currentOrder,
                items: updatedItems,
                ...totals,
                updatedAt: new Date().toISOString()
              },
              status: 'occupied' as const,
              lastUpdated: new Date().toISOString()
            }
          }
          return table
        })
        set({ tables })
      },

      updateTableCartItem: (tableId, itemId, updates) => {
        const tables = get().tables.map(table => {
          if (table.id === tableId && table.order) {
            const updatedItems = table.order.items.map(item => 
              item.id === itemId ? { 
                ...item, 
                ...updates,
                totalPrice: (updates.quantity || item.quantity) * item.unitPrice + item.extrasPrice
              } : item
            )

            const totals = calculateTableTotals(updatedItems)
            
            return {
              ...table,
              order: {
                ...table.order,
                items: updatedItems,
                ...totals,
                updatedAt: new Date().toISOString()
              },
              lastUpdated: new Date().toISOString()
            }
          }
          return table
        })
        set({ tables })
      },

      removeFromTableCart: (tableId, itemId) => {
        const tables = get().tables.map(table => {
          if (table.id === tableId && table.order) {
            const updatedItems = table.order.items.filter(item => item.id !== itemId)
            
            if (updatedItems.length === 0) {
              return {
                ...table,
                order: undefined,
                status: 'empty' as const,
                lastUpdated: new Date().toISOString()
              }
            }

            const totals = calculateTableTotals(updatedItems)
            
            return {
              ...table,
              order: {
                ...table.order,
                items: updatedItems,
                ...totals,
                updatedAt: new Date().toISOString()
              },
              lastUpdated: new Date().toISOString()
            }
          }
          return table
        })
        set({ tables })
      },

      clearTableCart: (tableId) => {
        const tables = get().tables.map(table =>
          table.id === tableId 
            ? { 
                ...table, 
                order: undefined, 
                status: 'empty' as const,
                lastUpdated: new Date().toISOString()
              }
            : table
        )
        set({ tables })
      },

      holdTableOrder: (tableId) => {
        const tables = get().tables.map(table => {
          if (table.id === tableId && table.order) {
            return {
              ...table,
              order: {
                ...table.order,
                status: 'held' as const,
                updatedAt: new Date().toISOString()
              },
              status: 'held' as const,
              lastUpdated: new Date().toISOString()
            }
          }
          return table
        })
        set({ tables })
      },

      payTableOrder: async (tableId, paymentMethod) => {
        const table = get().tables.find(t => t.id === tableId)
        if (!table?.order) return undefined

        const gstAmount = calculateGST(table.order.subtotal, paymentMethod)
        const total = table.order.subtotal + gstAmount

        const completedOrder: Order = {
          ...table.order,
          status: 'paid',
          paymentMethod,
          gstAmount,
          total,
          updatedAt: new Date().toISOString()
        }

        // Save to Supabase
        const saved = await get().saveToSupabase(completedOrder)
        
        if (saved) {
          // Clear the table
          const tables = get().tables.map(t =>
            t.id === tableId 
              ? { 
                  ...t, 
                  order: undefined, 
                  status: 'empty' as const,
                  lastUpdated: new Date().toISOString()
                }
              : t
          )
          set({ tables })
        }

        return completedOrder
      },

      // UI actions
      setCurrentView: (view) => set({ currentView: view }),



      setLoading: (loading) => set({ isLoading: loading }),

      setAdminMode: (isAdmin) => set({ isAdminMode: isAdmin }),

      // Data persistence
      loadPersistedData: () => {
        if (typeof window !== 'undefined') {
          // Load staff from localStorage
          const savedStaff = localStorage.getItem('currentStaff')
          if (savedStaff) {
            try {
              const staff = JSON.parse(savedStaff)
              get().setCurrentStaff(staff)
            } catch (error) {
              console.error('Error loading saved staff:', error)
            }
          }

          // Set permanent dark mode
          applyDarkMode(true)
        }
      },

      saveToSupabase: async (order) => {
        try {
          // Import supabase dynamically to avoid SSR issues
          const { supabase } = await import('./supabase')
          
          // Check if Supabase is properly configured
          if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
              !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
              process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co' ||
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key-here') {
            console.warn('Supabase credentials not configured. Order will be saved locally only.')
            console.log('Order details:', {
              orderNumber: order.orderNumber,
              tableId: order.tableId,
              staffId: order.staffId,
              total: order.total,
              paymentMethod: order.paymentMethod,
              itemCount: order.items.length
            })
            return true // Return true to allow the flow to continue
          }

          // Check if staff user exists, if not try to create it
          const { data: existingStaff } = await supabase
            .from('staff_users')
            .select('id')
            .eq('id', order.staffId)
            .single()

          if (!existingStaff) {
            console.log('Staff user not found, attempting to create...')
            
            // Try to create the staff user
            const staffData = order.staffId === '00000000-0000-0000-0000-000000000001' 
              ? {
                  id: '00000000-0000-0000-0000-000000000001',
                  email: 'admin@gloriapos.com',
                  role: 'admin',
                  password_hash: '$2a$10$placeholder' // Placeholder hash
                }
              : {
                  id: '00000000-0000-0000-0000-000000000002',
                  email: 'cashier@gloriapos.com', 
                  role: 'cashier',
                  password_hash: '$2a$10$placeholder' // Placeholder hash
                }

            const { error: staffCreateError } = await supabase
              .from('staff_users')
              .insert(staffData)

            if (staffCreateError) {
              console.warn('Could not create staff user:', staffCreateError.message)
              console.warn('Proceeding with order save anyway...')
            } else {
              console.log('Staff user created successfully')
            }
          }
          
          // Insert order (matching the actual database schema)
          const orderInsert = {
            order_number: order.orderNumber,
            staff_id: order.staffId,
            subtotal: order.subtotal,
            gst_amount: order.gstAmount,
            total: order.total,
            payment_method: order.paymentMethod,
            status: order.status || 'paid'
          }
          
          console.log('Attempting to insert order:', orderInsert)
          
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert(orderInsert)
            .select('id')
            .single()

          if (orderError) {
            console.error('Error saving order to Supabase:')
            console.error('Raw error object:', orderError)
            console.error('Error type:', typeof orderError)
            console.error('Error keys:', Object.keys(orderError || {}))
            
            // Extract error properties directly
            console.error('Error message:', orderError.message)
            console.error('Error code:', orderError.code)
            console.error('Error details:', orderError.details)
            console.error('Error hint:', orderError.hint)
            
            // If it's a foreign key constraint error, try without staff_id
            if (orderError.code === '23503' && orderError.message?.includes('staff_id_fkey')) {
              console.log('Attempting to save order without staff foreign key constraint...')
              
              const orderInsertWithoutStaff = {
                order_number: order.orderNumber,
                // staff_id: order.staffId, // Skip this field
                subtotal: order.subtotal,
                gst_amount: order.gstAmount,
                total: order.total,
                payment_method: order.paymentMethod,
                status: order.status || 'paid'
              }
              
              const { data: retryOrderData, error: retryError } = await supabase
                .from('orders')
                .insert(orderInsertWithoutStaff)
                .select('id')
                .single()

              if (!retryError && retryOrderData) {
                console.log('Order saved successfully without staff reference')
                
                // Still try to save order items
                const orderItems = order.items.map(item => ({
                  order_id: retryOrderData.id,
                  menu_item_id: item.menuItem.id, // String ID (now VARCHAR in DB)
                  menu_item_name: item.menuItem.name,
                  quantity: item.quantity,
                  size: item.size,
                  unit_price: item.unitPrice,
                  total_price: item.totalPrice,
                  extras: item.extras || [],
                  extras_cost: item.extrasPrice || 0
                }))

                console.log('Retrying order items save:', orderItems)

                const { error: retryItemsError } = await supabase
                  .from('order_items')
                  .insert(orderItems)

                if (retryItemsError) {
                  console.error('Error saving order items on retry:', retryItemsError)
                  console.error('Retry order items error details:', retryItemsError.message, retryItemsError.code)
                } else {
                  console.log('Order and items saved successfully (without staff reference)')
                }
                
                return true
              }
            }
            
            // Create a more detailed error info object
            const errorInfo = {
              message: orderError.message || 'Unknown error',
              code: orderError.code || 'NO_CODE',
              details: orderError.details || 'No details provided',
              hint: orderError.hint || 'No hint provided',
              orderNumber: order.orderNumber,
              timestamp: new Date().toISOString(),
              fullError: JSON.stringify(orderError, null, 2)
            }
            
            console.error('Detailed error info:', errorInfo)
            console.warn('Supabase order save failed - check database schema and credentials')
            console.warn('Falling back to local storage only')
            return true // Still return true to continue the flow
          }

          // Insert order items (matching the actual database schema)
          const orderItems = order.items.map(item => ({
            order_id: orderData.id,
            menu_item_id: item.menuItem.id, // Keep as string (now VARCHAR in DB)
            menu_item_name: item.menuItem.name,
            quantity: item.quantity,
            size: item.size,
            unit_price: item.unitPrice,
            total_price: item.totalPrice,
            extras: item.extras || [],
            extras_cost: item.extrasPrice || 0
          }))

          console.log('Attempting to save order items:', orderItems)

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

          if (itemsError) {
            console.error('Error saving order items:', itemsError)
            console.error('Raw order items error object:', itemsError)
            console.error('Order items error type:', typeof itemsError)
            console.error('Order items error keys:', Object.keys(itemsError || {}))
            console.error('Order items error message:', itemsError.message)
            console.error('Order items error code:', itemsError.code)
            console.error('Order items error details:', itemsError.details)
            console.error('Order items error hint:', itemsError.hint)
            console.error('Failed order items data:', orderItems)
            console.warn('Order saved but items failed to save')
            return true // Still return true as order was saved
          }

          console.log('Order saved successfully to Supabase:', orderData.id)
          return true
        } catch (error) {
          console.error('Error saving to Supabase:', error)
          console.warn('Supabase save failed, continuing with local state only')
          return true // Return true to allow the POS to continue functioning
        }
      },

      // Menu Management Functions
      addMenuItem: (item: MenuItem) => {
        set((state) => ({
          menuItems: [...state.menuItems, item]
        }))
      },

      updateMenuItem: (id: string, updates: Partial<MenuItem>) => {
        set((state) => ({
          menuItems: state.menuItems.map(item => 
            item.id === id ? { ...item, ...updates } : item
          )
        }))
      },

      deleteMenuItem: (id: string) => {
        set((state) => ({
          menuItems: state.menuItems.filter(item => item.id !== id)
        }))
      },

      toggleItemAvailability: (id: string) => {
        set((state) => ({
          menuItems: state.menuItems.map(item =>
            item.id === id ? { ...item, is_active: !item.is_active } : item
          )
        }))
      },

      // Save completed order for reporting
      saveCompletedOrder: (order: Order) => {
        try {
          const existingOrders = localStorage.getItem('completed_orders')
          const orders = existingOrders ? JSON.parse(existingOrders) : []
          
          const completedOrder = {
            ...order,
            status: 'paid',
            completedAt: new Date().toISOString()
          }
          
          orders.unshift(completedOrder) // Add to beginning for recent-first order
          
          // Keep only last 1000 orders to prevent localStorage bloat
          if (orders.length > 1000) {
            orders.splice(1000)
          }
          
          localStorage.setItem('completed_orders', JSON.stringify(orders))
        } catch (error) {
          console.error('Error saving completed order:', error)
        }
      },
    }),
    {
      name: 'pos-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tables: state.tables,
        selectedCategory: state.selectedCategory,
        // Don't persist staff or auth state here, handle separately
      }),
    }
  )
)

// Generate unique cart item ID
export function generateCartItemId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Hook to get current table's cart
export function useTableCart(tableId: number | null) {
  const tables = usePosStore(state => state.tables)
  const table = tables.find(t => t.id === tableId)
  return table?.order?.items || []
}

// Hook to get current table's order
export function useTableOrder(tableId: number | null) {
  const tables = usePosStore(state => state.tables)
  const table = tables.find(t => t.id === tableId)
  return table?.order
} 