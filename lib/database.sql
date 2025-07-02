-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Staff users table
CREATE TABLE staff_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'cashier')) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  sizes TEXT[] NOT NULL DEFAULT '{}',
  prices JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('draft', 'held', 'paid')) DEFAULT 'draft',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  gst_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card')),
  staff_id UUID REFERENCES staff_users(id) NULL, -- Made nullable for flexibility
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id VARCHAR(50) NULL, -- Changed from UUID to VARCHAR and made nullable
  menu_item_name VARCHAR(255) NOT NULL,
  size VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  extras TEXT[] DEFAULT '{}',
  extras_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_orders_staff_id ON orders(staff_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_is_active ON menu_items(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Staff users: Only authenticated users can read
CREATE POLICY "Allow read access to staff_users" ON staff_users
  FOR SELECT USING (true);

-- Menu items: Everyone can read active items
CREATE POLICY "Allow read access to active menu items" ON menu_items
  FOR SELECT USING (is_active = true);

-- Allow full access to menu items for authenticated users (admin/cashier)
CREATE POLICY "Allow full access to menu items for staff" ON menu_items
  FOR ALL USING (true);

-- Orders: Staff can manage orders
CREATE POLICY "Allow full access to orders for staff" ON orders
  FOR ALL USING (true);

-- Order items: Staff can manage order items
CREATE POLICY "Allow full access to order items for staff" ON order_items
  FOR ALL USING (true); 