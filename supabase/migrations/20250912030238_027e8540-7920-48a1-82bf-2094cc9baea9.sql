-- Add sample data for testing

-- Insert sample categories
INSERT INTO public.categories (name, description, is_active) 
SELECT 'Hot Coffee', 'Freshly brewed hot coffee beverages', true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Hot Coffee');

INSERT INTO public.categories (name, description, is_active) 
SELECT 'Iced Coffee', 'Refreshing iced coffee drinks', true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Iced Coffee');

INSERT INTO public.categories (name, description, is_active) 
SELECT 'Pastries', 'Fresh baked goods and pastries', true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Pastries');

INSERT INTO public.categories (name, description, is_active) 
SELECT 'Sandwiches', 'Delicious breakfast and lunch options', true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Sandwiches');

INSERT INTO public.categories (name, description, is_active) 
SELECT 'Beverages', 'Non-coffee drinks and smoothies', true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Beverages');

-- Insert sample menu items
INSERT INTO public.menu_items (name, description, price, category_id, is_available) 
SELECT 'Americano', 'Classic black coffee with hot water', 4.50, c.id, true
FROM categories c WHERE c.name = 'Hot Coffee' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Americano');

INSERT INTO public.menu_items (name, description, price, category_id, is_available) 
SELECT 'Latte', 'Espresso with steamed milk and foam', 5.25, c.id, true
FROM categories c WHERE c.name = 'Hot Coffee' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Latte');

INSERT INTO public.menu_items (name, description, price, category_id, is_available) 
SELECT 'Cappuccino', 'Equal parts espresso, steamed milk, and foam', 5.00, c.id, true
FROM categories c WHERE c.name = 'Hot Coffee' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Cappuccino');

INSERT INTO public.menu_items (name, description, price, category_id, is_available) 
SELECT 'Mocha', 'Espresso with chocolate and steamed milk', 5.75, c.id, true
FROM categories c WHERE c.name = 'Hot Coffee' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Mocha');

INSERT INTO public.menu_items (name, description, price, category_id, is_available) 
SELECT 'Iced Americano', 'Classic americano served over ice', 4.75, c.id, true
FROM categories c WHERE c.name = 'Iced Coffee' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Iced Americano');

INSERT INTO public.menu_items (name, description, price, category_id, is_available) 
SELECT 'Iced Latte', 'Chilled latte with cold milk', 5.50, c.id, true
FROM categories c WHERE c.name = 'Iced Coffee' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Iced Latte');

INSERT INTO public.menu_items (name, description, price, category_id, is_available) 
SELECT 'Cold Brew', 'Smooth cold-steeped coffee', 4.25, c.id, true
FROM categories c WHERE c.name = 'Iced Coffee' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Cold Brew');

INSERT INTO public.menu_items (name, description, price, category_id, is_available) 
SELECT 'Frappuccino', 'Blended iced coffee with whipped cream', 6.50, c.id, true
FROM categories c WHERE c.name = 'Iced Coffee' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Frappuccino');

INSERT INTO public.menu_items (name, description, price, category_id, is_available) 
SELECT 'Croissant', 'Buttery, flaky French pastry', 3.50, c.id, true
FROM categories c WHERE c.name = 'Pastries' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Croissant');

INSERT INTO public.menu_items (name, description, price, category_id, is_available) 
SELECT 'Muffin', 'Fresh baked blueberry muffin', 3.25, c.id, true
FROM categories c WHERE c.name = 'Pastries' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Muffin');

INSERT INTO public.menu_items (name, description, price, category_id, is_available) 
SELECT 'Danish', 'Sweet pastry with fruit filling', 4.00, c.id, true
FROM categories c WHERE c.name = 'Pastries' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Danish');

INSERT INTO public.menu_items (name, description, price, category_id, is_available) 
SELECT 'Breakfast Sandwich', 'Egg, cheese, and bacon on croissant', 7.50, c.id, true
FROM categories c WHERE c.name = 'Sandwiches' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Breakfast Sandwich');

INSERT INTO public.menu_items (name, description, price, category_id, is_available) 
SELECT 'Club Sandwich', 'Triple decker with turkey and bacon', 9.25, c.id, true
FROM categories c WHERE c.name = 'Sandwiches' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Club Sandwich');

INSERT INTO public.menu_items (name, description, price, category_id, is_available) 
SELECT 'Orange Juice', 'Fresh squeezed orange juice', 3.75, c.id, true
FROM categories c WHERE c.name = 'Beverages' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Orange Juice');

INSERT INTO public.menu_items (name, description, price, category_id, is_available) 
SELECT 'Hot Tea', 'Selection of premium teas', 3.50, c.id, true
FROM categories c WHERE c.name = 'Beverages' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Hot Tea');

-- Insert sample orders with various statuses
INSERT INTO public.orders (order_number, customer_name, subtotal, tax_amount, total_amount, status, payment_method) 
SELECT 'ORD-20250906-0001', 'Sarah Johnson', 10.50, 0.84, 11.34, 'completed', 'cash'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20250906-0001');

INSERT INTO public.orders (order_number, customer_name, subtotal, tax_amount, total_amount, status, payment_method) 
SELECT 'ORD-20250906-0002', 'Mike Chen', 4.75, 0.38, 5.13, 'completed', 'card'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20250906-0002');

INSERT INTO public.orders (order_number, customer_name, subtotal, tax_amount, total_amount, status, payment_method) 
SELECT 'ORD-20250906-0003', 'Lisa Park', 18.25, 1.46, 19.71, 'pending', NULL
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20250906-0003');

INSERT INTO public.orders (order_number, customer_name, subtotal, tax_amount, total_amount, status, payment_method) 
SELECT 'ORD-20250906-0004', 'David Wilson', 9.00, 0.72, 9.72, 'in_progress', NULL
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20250906-0004');

INSERT INTO public.orders (order_number, customer_name, subtotal, tax_amount, total_amount, status, payment_method) 
SELECT 'ORD-20250906-0005', 'Emma Davis', 7.75, 0.62, 8.37, 'ready', NULL
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20250906-0005');

INSERT INTO public.orders (order_number, customer_name, subtotal, tax_amount, total_amount, status, payment_method) 
SELECT 'ORD-20250906-0006', 'James Brown', 6.25, 0.50, 6.75, 'pending', NULL
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20250906-0006');

INSERT INTO public.orders (order_number, customer_name, subtotal, tax_amount, total_amount, status, payment_method) 
SELECT 'ORD-20250906-0007', 'Anna White', 15.50, 1.24, 16.74, 'in_progress', NULL
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20250906-0007');

INSERT INTO public.orders (order_number, customer_name, subtotal, tax_amount, total_amount, status, payment_method) 
SELECT 'ORD-20250906-0008', 'Robert Green', 11.75, 0.94, 12.69, 'ready', NULL
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20250906-0008');