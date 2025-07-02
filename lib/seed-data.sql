-- Seed data for Gloria Jean's Coffees POS

-- ESPRESSO MENU - CLASSICS
INSERT INTO menu_items (name, category, sizes, prices) VALUES
('Cappuccino / Caffé Latté', 'Espresso - Classics', ARRAY['Small', 'Regular', 'Large'], '{"Small": 750, "Regular": 795, "Large": 900}'),
('Caffé Americano', 'Espresso - Classics', ARRAY['Small', 'Regular', 'Large'], '{"Small": 550, "Regular": 675, "Large": 750}'),
('Espresso / Ristretto / Macchiato / Piccolo Latté', 'Espresso - Classics', ARRAY['Regular'], '{"Regular": 525}');

-- ESPRESSO MENU - SPECIALTIES
INSERT INTO menu_items (name, category, sizes, prices) VALUES
('Caffé Mocha', 'Espresso - Specialties', ARRAY['Small', 'Regular', 'Large'], '{"Small": 850, "Regular": 925, "Large": 1050}'),
('Caramel Latté', 'Espresso - Specialties', ARRAY['Small', 'Regular', 'Large'], '{"Small": 850, "Regular": 925, "Large": 1050}'),
('Very Vanilla Latté', 'Espresso - Specialties', ARRAY['Small', 'Regular', 'Large'], '{"Small": 850, "Regular": 925, "Large": 1050}'),
('Irish Nut Crème', 'Espresso - Specialties', ARRAY['Small', 'Regular', 'Large'], '{"Small": 850, "Regular": 925, "Large": 1050}'),
('White Chocolate Mocha', 'Espresso - Specialties', ARRAY['Small', 'Regular', 'Large'], '{"Small": 850, "Regular": 925, "Large": 1050}'),
('Mocha Caramelatte', 'Espresso - Specialties', ARRAY['Small', 'Regular', 'Large'], '{"Small": 850, "Regular": 925, "Large": 1050}'),
('Chocolate Macadamia Latté', 'Espresso - Specialties', ARRAY['Small', 'Regular', 'Large'], '{"Small": 850, "Regular": 925, "Large": 1050}'),
('Crème Brulee Latté', 'Espresso - Specialties', ARRAY['Small', 'Regular', 'Large'], '{"Small": 850, "Regular": 925, "Large": 1050}'),
('Hazelnut Latté', 'Espresso - Specialties', ARRAY['Small', 'Regular', 'Large'], '{"Small": 850, "Regular": 925, "Large": 1050}'),
('Mocha Truffle Latté', 'Espresso - Specialties', ARRAY['Small', 'Regular', 'Large'], '{"Small": 850, "Regular": 925, "Large": 1050}'),
('Minicino / Babycino', 'Espresso - Specialties', ARRAY['Regular'], '{"Regular": 550}');

-- TEA
INSERT INTO menu_items (name, category, sizes, prices) VALUES
('Hot Tea (English Breakfast, Green Tea)', 'Tea', ARRAY['All Sizes'], '{"All Sizes": 550}'),
('Chai Tea Latté', 'Tea', ARRAY['Small', 'Regular', 'Large'], '{"Small": 850, "Regular": 925, "Large": 1050}');

-- HOT CHOCOLATE
INSERT INTO menu_items (name, category, sizes, prices) VALUES
('Classic Hot Chocolate', 'Hot Chocolate', ARRAY['Small', 'Regular', 'Large'], '{"Small": 875, "Regular": 925, "Large": 1050}'),
('White Hot Chocolate', 'Hot Chocolate', ARRAY['Small', 'Regular', 'Large'], '{"Small": 875, "Regular": 925, "Large": 1050}'),
('GJC''s Creamy Hot Cocoa', 'Hot Chocolate', ARRAY['Small', 'Regular', 'Large'], '{"Small": 875, "Regular": 925, "Large": 1050}');

-- EXTRAS
INSERT INTO menu_items (name, category, sizes, prices) VALUES
('Espresso Shot', 'Extras', ARRAY['Any Size'], '{"Any Size": 350}'),
('Flavour Syrup', 'Extras', ARRAY['Any Size'], '{"Any Size": 350}'),
('Whipped Cream', 'Extras', ARRAY['Any Size'], '{"Any Size": 350}');

-- CHILLERS MENU - ESPRESSO CHILLERS
INSERT INTO menu_items (name, category, sizes, prices) VALUES
('Very Vanilla Chiller', 'Chillers - Espresso', ARRAY['Small', 'Regular', 'Large'], '{"Small": 950, "Regular": 1050, "Large": 1150}'),
('Crème Brule', 'Chillers - Espresso', ARRAY['Small', 'Regular', 'Large'], '{"Small": 950, "Regular": 1050, "Large": 1150}'),
('Voltage', 'Chillers - Espresso', ARRAY['Small', 'Regular', 'Large'], '{"Small": 950, "Regular": 1050, "Large": 1150}'),
('Mocha Java Voltage', 'Chillers - Espresso', ARRAY['Small', 'Regular', 'Large'], '{"Small": 950, "Regular": 1050, "Large": 1150}');

-- CHILLERS MENU - MOCHA CHILLERS
INSERT INTO menu_items (name, category, sizes, prices) VALUES
('Cocoa Loco', 'Chillers - Mocha', ARRAY['Small', 'Regular', 'Large'], '{"Small": 950, "Regular": 1050, "Large": 1150}'),
('Cookies ''N Cream', 'Chillers - Mocha', ARRAY['Small', 'Regular', 'Large'], '{"Small": 950, "Regular": 1050, "Large": 1150}'),
('Mint Chocolate Bomb', 'Chillers - Mocha', ARRAY['Small', 'Regular', 'Large'], '{"Small": 975, "Regular": 1050, "Large": 1150}'),
('Crunchy Cookie Chiller', 'Chillers - Mocha', ARRAY['Small', 'Regular', 'Large'], '{"Small": 975, "Regular": 1050, "Large": 1150}');

-- CHILLERS MENU - GOURMET ICED CHOCOLATES
INSERT INTO menu_items (name, category, sizes, prices) VALUES
('Original Iced Chocolate', 'Chillers - Gourmet Iced', ARRAY['Small', 'Regular', 'Large'], '{"Small": 975, "Regular": 1050, "Large": 1150}'),
('Strawberries ''N Cream', 'Chillers - Gourmet Iced', ARRAY['Small', 'Regular', 'Large'], '{"Small": 975, "Regular": 1050, "Large": 1150}'),
('Mango Macadamia', 'Chillers - Gourmet Iced', ARRAY['Small', 'Regular', 'Large'], '{"Small": 975, "Regular": 1050, "Large": 1150}'),
('Coconut White Chocolate', 'Chillers - Gourmet Iced', ARRAY['Small', 'Regular', 'Large'], '{"Small": 975, "Regular": 1050, "Large": 1150}');

-- CHILLERS MENU - FRUIT CHILLERS & SMOOTHIES
INSERT INTO menu_items (name, category, sizes, prices) VALUES
('Mango Chiller', 'Chillers - Fruit', ARRAY['Small', 'Regular', 'Large'], '{"Small": 1050, "Regular": 1150, "Large": 1300}'),
('Strawberry Chiller', 'Chillers - Fruit', ARRAY['Small', 'Regular', 'Large'], '{"Small": 1050, "Regular": 1150, "Large": 1300}'),
('Mixed Berry Chiller', 'Chillers - Fruit', ARRAY['Small', 'Regular', 'Large'], '{"Small": 1050, "Regular": 1150, "Large": 1300}'),
('Mango Smoothie', 'Smoothies', ARRAY['Small', 'Regular', 'Large'], '{"Small": 1100, "Regular": 1250, "Large": 1400}'),
('Strawberry Smoothie', 'Smoothies', ARRAY['Small', 'Regular', 'Large'], '{"Small": 1100, "Regular": 1250, "Large": 1400}'),
('Mixed Berry Smoothie', 'Smoothies', ARRAY['Small', 'Regular', 'Large'], '{"Small": 1100, "Regular": 1250, "Large": 1400}');

-- CHILLERS MENU - OVER ICE
INSERT INTO menu_items (name, category, sizes, prices) VALUES
('Signature Iced Coffee', 'Over Ice', ARRAY['Small', 'Regular', 'Large'], '{"Small": 975, "Regular": 1050, "Large": 1150}'),
('Iced Latté', 'Over Ice', ARRAY['Small', 'Regular', 'Large'], '{"Small": 975, "Regular": 1050, "Large": 1150}'),
('Iced Mocha', 'Over Ice', ARRAY['Small', 'Regular', 'Large'], '{"Small": 975, "Regular": 1050, "Large": 1150}'),
('Iced Americano', 'Over Ice', ARRAY['Small', 'Regular', 'Large'], '{"Small": 800, "Regular": 950, "Large": 1050}'),
('Italian Soda', 'Over Ice', ARRAY['All Sizes'], '{"All Sizes": 850}'),
('Iced Tea', 'Over Ice', ARRAY['All Sizes'], '{"All Sizes": 675}');

-- FRESHLY MADE, CHEF-CRAFTED BITES
INSERT INTO menu_items (name, category, sizes, prices) VALUES
('The Grande Zinger', 'Food', ARRAY['Regular'], '{"Regular": 700}'),
('Sandwich', 'Food', ARRAY['Regular'], '{"Regular": 850}'),
('Fries', 'Food', ARRAY['Regular'], '{"Regular": 400}'),
('Masala Fries', 'Food', ARRAY['Regular'], '{"Regular": 500}'),
('Stuffed Chicken Bread Slice', 'Food', ARRAY['Regular'], '{"Regular": 200}'),
('Pizza Slice', 'Food', ARRAY['Regular'], '{"Regular": 300}'),
('The Sizzling Fajita Pizza', 'Food', ARRAY['Regular'], '{"Regular": 1200}'),
('The Signature Chicken Spaghetti', 'Food', ARRAY['Regular'], '{"Regular": 950}'),
('Butter Milk Fries Drum Stick', 'Food', ARRAY['Regular'], '{"Regular": 600}');

-- DEALS
INSERT INTO menu_items (name, category, sizes, prices) VALUES
('Cappuccino (small) / Sandwich', 'Deals', ARRAY['Combo'], '{"Combo": 1400}'),
('Caffé Latté (small) / Chicken Bread', 'Deals', ARRAY['Combo'], '{"Combo": 1350}'),
('Cappuccino (small) / Sandwich & Fries', 'Deals', ARRAY['Combo'], '{"Combo": 1700}'),
('Sandwich / Fries & Cold Drink', 'Deals', ARRAY['Combo'], '{"Combo": 1300}'),
('Pizza / Cold Drink', 'Deals', ARRAY['Combo'], '{"Combo": 1350}'),
('Chicken Bread / Shake', 'Deals', ARRAY['Combo'], '{"Combo": 1200}'),
('Spaghetti / (small) Cappuccino', 'Deals', ARRAY['Combo'], '{"Combo": 1500}'),
('Spaghetti / Shake', 'Deals', ARRAY['Combo'], '{"Combo": 1500}'),
('The Classic Shami / Melt Cold Drinks', 'Deals', ARRAY['Combo'], '{"Combo": 650}'); 