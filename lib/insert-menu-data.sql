-- Insert new menu data into Supabase menu_items table
-- Only keeping descriptions for combo items as requested

-- HOUSE SIGNATURES
INSERT INTO menu_items (name, category, sizes, prices, is_active) VALUES
('The Grande Zinger', 'House Signatures', ARRAY['Regular'], '{"Regular": 1200}', true),
('The Club Sandwich', 'House Signatures', ARRAY['Regular'], '{"Regular": 1450}', true),
('Stuffed Chicken Bread', 'House Signatures', ARRAY['Regular'], '{"Regular": 1250}', true),
('The Sizzling Fajita Pizza', 'House Signatures', ARRAY['Regular'], '{"Regular": 1250}', true);

-- FROM THE PASTA STATION
INSERT INTO menu_items (name, category, sizes, prices, is_active) VALUES
('Alfredo Pasta', 'Pasta Station', ARRAY['Regular'], '{"Regular": 1250}', true),
('Chicken Spaghetti', 'Pasta Station', ARRAY['Regular'], '{"Regular": 1400}', true);

-- SNACKS
INSERT INTO menu_items (name, category, sizes, prices, is_active) VALUES
('Fries', 'Snacks', ARRAY['Regular'], '{"Regular": 400}', true),
('Masala Fries', 'Snacks', ARRAY['Regular'], '{"Regular": 500}', true),
('Pizza by Slice', 'Snacks', ARRAY['Regular'], '{"Regular": 350}', true),
('Chicken Bread Slice', 'Snacks', ARRAY['Regular'], '{"Regular": 300}', true);

-- GLORIA'S CRAVE COMBO (with descriptions)
INSERT INTO menu_items (name, category, sizes, prices, description, is_active) VALUES
('The Crisp Combo', 'Gloria''s Crave Combo', ARRAY['Combo'], '{"Combo": 1450}', 'Grande zinger with 1 soft drink', true),
('The Club Combo', 'Gloria''s Crave Combo', ARRAY['Combo'], '{"Combo": 1900}', 'Signature Club Sandwich with fries and 1 soft drink', true),
('Slice and Sip Combo', 'Gloria''s Crave Combo', ARRAY['Combo'], '{"Combo": 1950}', 'Sizzling Fajita Pizza with 2 soft drinks', true),
('The Loaded Duo', 'Gloria''s Crave Combo', ARRAY['Combo'], '{"Combo": 2500}', 'Grande Zinger, Stuffed chicken bread and 2 drinks', true),
('The Grande Combo', 'Gloria''s Crave Combo', ARRAY['Combo'], '{"Combo": 3100}', 'Sizzling Fajita Pizza, Signature club sandwich with masala fries', true);

-- WARM & GOOEY
INSERT INTO menu_items (name, category, sizes, prices, is_active) VALUES
('Chocolate Brownie', 'Warm & Gooey', ARRAY['Regular'], '{"Regular": 450}', true),
('Fudge Brownie', 'Warm & Gooey', ARRAY['Regular'], '{"Regular": 450}', true),
('Nutella Brownie', 'Warm & Gooey', ARRAY['Regular'], '{"Regular": 450}', true),
('Walnut Brownie', 'Warm & Gooey', ARRAY['Regular'], '{"Regular": 450}', true),
('Molten Lava Cake', 'Warm & Gooey', ARRAY['Regular'], '{"Regular": 550}', true),
('Chocolate Mousse', 'Warm & Gooey', ARRAY['Regular'], '{"Regular": 450}', true),
('Banana Bread', 'Warm & Gooey', ARRAY['Regular'], '{"Regular": 450}', true),
('Chocolate Chip Cookie', 'Warm & Gooey', ARRAY['Regular'], '{"Regular": 450}', true);

-- GLORIA'S SIGNATURE CAKES
INSERT INTO menu_items (name, category, sizes, prices, is_active) VALUES
('New York Cheese Cake Slice', 'Gloria''s Signature Cakes', ARRAY['Regular'], '{"Regular": 950}', true),
('Vanilla Lotus mini cake', 'Gloria''s Signature Cakes', ARRAY['Regular'], '{"Regular": 450}', true),
('Fudge Cake Slice', 'Gloria''s Signature Cakes', ARRAY['Regular'], '{"Regular": 500}', true),
('Plain Muffin', 'Gloria''s Signature Cakes', ARRAY['Regular'], '{"Regular": 450}', true),
('Blue Berry Muffin', 'Gloria''s Signature Cakes', ARRAY['Regular'], '{"Regular": 450}', true),
('Chocolate Muffin', 'Gloria''s Signature Cakes', ARRAY['Regular'], '{"Regular": 450}', true);

-- BEVERAGES
INSERT INTO menu_items (name, category, sizes, prices, is_active) VALUES
('Water', 'Beverages', ARRAY['Regular'], '{"Regular": 200}', true),
('7up', 'Beverages', ARRAY['Regular'], '{"Regular": 350}', true),
('Pepsi', 'Beverages', ARRAY['Regular'], '{"Regular": 350}', true); 