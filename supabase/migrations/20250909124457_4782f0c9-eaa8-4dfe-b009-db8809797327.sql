-- Add missing enums and tables for complete POS functionality

-- Add order status history table
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  status order_status NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add notifications table  
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert sample categories if they don't exist
INSERT INTO public.categories (name, description, is_active) VALUES
  ('Hot Coffee', 'Freshly brewed hot coffee beverages', true),
  ('Iced Coffee', 'Refreshing iced coffee drinks', true),  
  ('Pastries', 'Fresh baked goods and pastries', true),
  ('Sandwiches', 'Delicious breakfast and lunch options', true),
  ('Beverages', 'Non-coffee drinks and smoothies', true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample menu items
INSERT INTO public.menu_items (name, description, price, category_id, is_available) VALUES
  ('Americano', 'Classic black coffee with hot water', 4.50, (SELECT id FROM categories WHERE name = 'Hot Coffee' LIMIT 1), true),
  ('Latte', 'Espresso with steamed milk and foam', 5.25, (SELECT id FROM categories WHERE name = 'Hot Coffee' LIMIT 1), true),
  ('Cappuccino', 'Equal parts espresso, steamed milk, and foam', 5.00, (SELECT id FROM categories WHERE name = 'Hot Coffee' LIMIT 1), true),
  ('Mocha', 'Espresso with chocolate and steamed milk', 5.75, (SELECT id FROM categories WHERE name = 'Hot Coffee' LIMIT 1), true),
  ('Espresso', 'Pure concentrated coffee shot', 3.25, (SELECT id FROM categories WHERE name = 'Hot Coffee' LIMIT 1), true),
  ('Iced Americano', 'Classic americano served over ice', 4.75, (SELECT id FROM categories WHERE name = 'Iced Coffee' LIMIT 1), true),
  ('Iced Latte', 'Chilled latte with cold milk', 5.50, (SELECT id FROM categories WHERE name = 'Iced Coffee' LIMIT 1), true),
  ('Cold Brew', 'Smooth cold-steeped coffee', 4.25, (SELECT id FROM categories WHERE name = 'Iced Coffee' LIMIT 1), true),
  ('Frappuccino', 'Blended iced coffee with whipped cream', 6.50, (SELECT id FROM categories WHERE name = 'Iced Coffee' LIMIT 1), true),
  ('Croissant', 'Buttery, flaky French pastry', 3.50, (SELECT id FROM categories WHERE name = 'Pastries' LIMIT 1), true),
  ('Muffin', 'Fresh baked blueberry muffin', 3.25, (SELECT id FROM categories WHERE name = 'Pastries' LIMIT 1), true),
  ('Danish', 'Sweet pastry with fruit filling', 4.00, (SELECT id FROM categories WHERE name = 'Pastries' LIMIT 1), true),
  ('Breakfast Sandwich', 'Egg, cheese, and bacon on croissant', 7.50, (SELECT id FROM categories WHERE name = 'Sandwiches' LIMIT 1), true),
  ('Club Sandwich', 'Triple decker with turkey and bacon', 9.25, (SELECT id FROM categories WHERE name = 'Sandwiches' LIMIT 1), true),
  ('Orange Juice', 'Fresh squeezed orange juice', 3.75, (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), true),
  ('Hot Tea', 'Selection of premium teas', 3.50, (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample orders with different statuses
INSERT INTO public.orders (order_number, customer_name, subtotal, tax_amount, total_amount, status, payment_method) VALUES
  ('ORD-20250906-0001', 'Sarah Johnson', 10.50, 0.84, 11.34, 'completed', 'cash'),
  ('ORD-20250906-0002', 'Mike Chen', 4.75, 0.38, 5.13, 'completed', 'card'),  
  ('ORD-20250906-0003', 'Lisa Park', 18.25, 1.46, 19.71, 'pending', NULL),
  ('ORD-20250906-0004', 'David Wilson', 9.00, 0.72, 9.72, 'in_progress', NULL),
  ('ORD-20250906-0005', 'Emma Davis', 7.75, 0.62, 8.37, 'ready', NULL),
  ('ORD-20250906-0006', 'James Brown', 6.25, 0.50, 6.75, 'pending', NULL),
  ('ORD-20250906-0007', 'Anna White', 15.50, 1.24, 16.74, 'in_progress', NULL),
  ('ORD-20250906-0008', 'Robert Green', 11.75, 0.94, 12.69, 'ready', NULL)
ON CONFLICT (order_number) DO NOTHING;

-- Insert sample order items
DO $$
DECLARE
  order1_id UUID := (SELECT id FROM orders WHERE order_number = 'ORD-20250906-0001');
  order2_id UUID := (SELECT id FROM orders WHERE order_number = 'ORD-20250906-0002');
  order3_id UUID := (SELECT id FROM orders WHERE order_number = 'ORD-20250906-0003');
  order4_id UUID := (SELECT id FROM orders WHERE order_number = 'ORD-20250906-0004');
  order5_id UUID := (SELECT id FROM orders WHERE order_number = 'ORD-20250906-0005');
  order6_id UUID := (SELECT id FROM orders WHERE order_number = 'ORD-20250906-0006');
  order7_id UUID := (SELECT id FROM orders WHERE order_number = 'ORD-20250906-0007');
  order8_id UUID := (SELECT id FROM orders WHERE order_number = 'ORD-20250906-0008');
BEGIN
  -- Order 1: Sarah Johnson (2 Lattes)
  INSERT INTO public.order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
    (order1_id, (SELECT id FROM menu_items WHERE name = 'Latte' LIMIT 1), 2, 5.25, 10.50);
    
  -- Order 2: Mike Chen (1 Iced Americano)  
  INSERT INTO public.order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
    (order2_id, (SELECT id FROM menu_items WHERE name = 'Iced Americano' LIMIT 1), 1, 4.75, 4.75);
    
  -- Order 3: Lisa Park (2 Cappuccinos, 1 Breakfast Sandwich, 1 Orange Juice)
  INSERT INTO public.order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
    (order3_id, (SELECT id FROM menu_items WHERE name = 'Cappuccino' LIMIT 1), 2, 5.00, 10.00),
    (order3_id, (SELECT id FROM menu_items WHERE name = 'Breakfast Sandwich' LIMIT 1), 1, 7.50, 7.50),
    (order3_id, (SELECT id FROM menu_items WHERE name = 'Orange Juice' LIMIT 1), 1, 3.75, 3.75);
    
  -- Order 4: David Wilson (2 Americanos) 
  INSERT INTO public.order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
    (order4_id, (SELECT id FROM menu_items WHERE name = 'Americano' LIMIT 1), 2, 4.50, 9.00);
    
  -- Order 5: Emma Davis (1 Mocha, 1 Croissant)
  INSERT INTO public.order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
    (order5_id, (SELECT id FROM menu_items WHERE name = 'Mocha' LIMIT 1), 1, 5.75, 5.75),
    (order5_id, (SELECT id FROM menu_items WHERE name = 'Croissant' LIMIT 1), 1, 3.50, 3.50);
    
  -- Order 6: James Brown (1 Latte)  
  INSERT INTO public.order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
    (order6_id, (SELECT id FROM menu_items WHERE name = 'Latte' LIMIT 1), 1, 5.25, 5.25);
    
  -- Order 7: Anna White (2 Frappuccinos)
  INSERT INTO public.order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
    (order7_id, (SELECT id FROM menu_items WHERE name = 'Frappuccino' LIMIT 1), 2, 6.50, 13.00);
    
  -- Order 8: Robert Green (2 Iced Lattes)  
  INSERT INTO public.order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
    (order8_id, (SELECT id FROM menu_items WHERE name = 'Iced Latte' LIMIT 1), 2, 5.50, 11.00);
END $$;

-- Enable RLS on new tables
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_status_history
CREATE POLICY "Anyone can view order status history" 
ON public.order_status_history FOR SELECT USING (true);

CREATE POLICY "Staff can create order status history" 
ON public.order_status_history FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS policies for notifications  
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT 
USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can create notifications"
ON public.notifications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"  
ON public.notifications FOR UPDATE
USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));