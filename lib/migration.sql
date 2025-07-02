-- Migration script for existing Gloria Jean's POS databases
-- Run this if you already have the database set up and need to fix compatibility issues

-- Make staff_id nullable in orders table (if it exists and is not nullable)
ALTER TABLE orders ALTER COLUMN staff_id DROP NOT NULL;

-- Create default staff users with fixed UUIDs (if they don't exist)
INSERT INTO staff_users (id, email, role, password_hash, created_at, updated_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'admin@gloriapos.com',
    'admin',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Password: 7890
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000002', 
    'cashier@gloriapos.com',
    'cashier',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Password: 1111
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Alternative: if you want to update existing staff with these IDs
-- UPDATE staff_users SET id = '00000000-0000-0000-0000-000000000001' WHERE role = 'admin' AND email = 'admin@gloriapos.com';
-- UPDATE staff_users SET id = '00000000-0000-0000-0000-000000000002' WHERE role = 'cashier' AND email = 'cashier@gloriapos.com';

-- Ensure proper indexes still exist
CREATE INDEX IF NOT EXISTS idx_orders_staff_id ON orders(staff_id);

-- If you want to disable RLS temporarily for testing:
-- ALTER TABLE staff_users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;

-- Note: The password hashes above are placeholders. 
-- In production, you should generate proper bcrypt hashes for the passwords 7890 and 1111 

-- Fix menu_item_id column in order_items table
-- Drop the foreign key constraint first
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_menu_item_id_fkey;

-- Change the column type from UUID to VARCHAR and make it nullable
ALTER TABLE order_items ALTER COLUMN menu_item_id TYPE VARCHAR(50);
ALTER TABLE order_items ALTER COLUMN menu_item_id DROP NOT NULL; 