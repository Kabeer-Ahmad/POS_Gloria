import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      staff_users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'cashier'
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'admin' | 'cashier'
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'cashier'
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          name: string
          category: string
          sizes: string[]
          prices: Record<string, number>
          description?: string
          image_url?: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          sizes: string[]
          prices: Record<string, number>
          description?: string
          image_url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          sizes?: string[]
          prices?: Record<string, number>
          description?: string
          image_url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          status: 'draft' | 'held' | 'paid'
          subtotal: number
          gst_amount: number
          total: number
          payment_method?: 'cash' | 'card'
          staff_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          status?: 'draft' | 'held' | 'paid'
          subtotal: number
          gst_amount: number
          total: number
          payment_method?: 'cash' | 'card'
          staff_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          status?: 'draft' | 'held' | 'paid'
          subtotal?: number
          gst_amount?: number
          total?: number
          payment_method?: 'cash' | 'card'
          staff_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string
          menu_item_name: string
          size: string
          quantity: number
          unit_price: number
          total_price: number
          extras?: string[]
          extras_cost: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id: string
          menu_item_name: string
          size: string
          quantity: number
          unit_price: number
          total_price: number
          extras?: string[]
          extras_cost?: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string
          menu_item_name?: string
          size?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          extras?: string[]
          extras_cost?: number
          created_at?: string
        }
      }
    }
  }
} 