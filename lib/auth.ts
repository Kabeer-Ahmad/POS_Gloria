import bcrypt from 'bcryptjs'
import { supabase } from './supabase'

export interface Staff {
  id: string
  email: string
  role: 'admin' | 'cashier'
  created_at: string
}

export interface AuthSession {
  staff: Staff
  expires: number
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Login with email and password
export async function loginStaff(email: string, password: string): Promise<Staff | null> {
  try {
    const { data: staff, error } = await supabase
      .from('staff_users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !staff) {
      return null
    }

    const isValidPassword = await verifyPassword(password, staff.password_hash)
    if (!isValidPassword) {
      return null
    }

    return {
      id: staff.id,
      email: staff.email,
      role: staff.role,
      created_at: staff.created_at
    }
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
}

// Quick login with role and predefined password (for demo/initial setup)
export async function quickLogin(role: 'admin' | 'cashier', password: string): Promise<Staff | null> {
  const expectedPassword = role === 'admin' 
    ? '7890'  // Admin password
    : '1111'  // Cashier password

  if (password !== expectedPassword) {
    return null
  }

  // Return a mock staff object with proper UUIDs for database compatibility
  return {
    id: role === 'admin' 
      ? '00000000-0000-0000-0000-000000000001'  // Fixed UUID for admin
      : '00000000-0000-0000-0000-000000000002', // Fixed UUID for cashier
    email: role === 'admin' ? 'admin@gloriapos.com' : 'cashier@gloriapos.com',
    role,
    created_at: new Date().toISOString()
  }
}

// Create initial staff users with fixed UUIDs
export async function createInitialStaff() {
  try {
    const adminEmail = 'admin@gloriapos.com'
    const cashierEmail = 'cashier@gloriapos.com'
    
    const adminPassword = '7890'    // Admin password
    const cashierPassword = '1111'  // Cashier password

    const adminHash = await hashPassword(adminPassword)
    const cashierHash = await hashPassword(cashierPassword)

    // Insert admin user with fixed UUID
    await supabase
      .from('staff_users')
      .upsert([
        {
          id: '00000000-0000-0000-0000-000000000001',
          email: adminEmail,
          role: 'admin' as const,
          password_hash: adminHash
        }
      ], { onConflict: 'email' })

    // Insert cashier user with fixed UUID
    await supabase
      .from('staff_users')
      .upsert([
        {
          id: '00000000-0000-0000-0000-000000000002',
          email: cashierEmail,
          role: 'cashier' as const,
          password_hash: cashierHash
        }
      ], { onConflict: 'email' })

    console.log('Initial staff users created successfully')
  } catch (error) {
    console.error('Error creating initial staff:', error)
  }
}

// Session management utilities for client-side
export function saveSession(staff: Staff) {
  const session: AuthSession = {
    staff,
    expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  }
  localStorage.setItem('gloria_pos_session', JSON.stringify(session))
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  
  const sessionData = localStorage.getItem('gloria_pos_session')
  if (!sessionData) return null

  try {
    const session: AuthSession = JSON.parse(sessionData)
    
    // Check if session is expired
    if (Date.now() > session.expires) {
      clearSession()
      return null
    }

    return session
  } catch {
    clearSession()
    return null
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('gloria_pos_session')
  }
}

export function isAdmin(staff?: Staff | null): boolean {
  return staff?.role === 'admin'
}

export function isCashier(staff?: Staff | null): boolean {
  return staff?.role === 'cashier'
}

export function canManageMenu(staff?: Staff | null): boolean {
  return isAdmin(staff)
}

export function canViewReports(staff?: Staff | null): boolean {
  return isAdmin(staff)
}

export function canDeleteOrders(staff?: Staff | null): boolean {
  return isAdmin(staff)
} 