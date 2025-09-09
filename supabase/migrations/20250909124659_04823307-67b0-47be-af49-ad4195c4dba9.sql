-- Add missing tables and sample data for complete POS functionality

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

-- Insert sample categories (check if they exist first)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Hot Coffee') THEN
    INSERT INTO public.categories (name, description, is_active) VALUES ('Hot Coffee', 'Freshly brewed hot coffee beverages', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Iced Coffee') THEN
    INSERT INTO public.categories (name, description, is_active) VALUES ('Iced Coffee', 'Refreshing iced coffee drinks', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Pastries') THEN
    INSERT INTO public.categories (name, description, is_active) VALUES ('Pastries', 'Fresh baked goods and pastries', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Sandwiches') THEN
    INSERT INTO public.categories (name, description, is_active) VALUES ('Sandwiches', 'Delicious breakfast and lunch options', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Beverages') THEN
    INSERT INTO public.categories (name, description, is_active) VALUES ('Beverages', 'Non-coffee drinks and smoothies', true);
  END IF;
END $$;

-- Insert sample menu items
DO $$
BEGIN
  -- Hot Coffee items
  IF NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Americano') THEN
    INSERT INTO public.menu_items (name, description, price, category_id, is_available) VALUES
    ('Americano', 'Classic black coffee with hot water', 4.50, (SELECT id FROM categories WHERE name = 'Hot Coffee' LIMIT 1), true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Latte') THEN
    INSERT INTO public.menu_items (name, description, price, category_id, is_available) VALUES
    ('Latte', 'Espresso with steamed milk and foam', 5.25, (SELECT id FROM categories WHERE name = 'Hot Coffee' LIMIT 1), true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Cappuccino') THEN
    INSERT INTO public.menu_items (name, description, price, category_id, is_available) VALUES
    ('Cappuccino', 'Equal parts espresso, steamed milk, and foam', 5.00, (SELECT id FROM categories WHERE name = 'Hot Coffee' LIMIT 1), true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Mocha') THEN
    INSERT INTO public.menu_items (name, description, price, category_id, is_available) VALUES
    ('Mocha', 'Espresso with chocolate and steamed milk', 5.75, (SELECT id FROM categories WHERE name = 'Hot Coffee' LIMIT 1), true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Espresso') THEN
    INSERT INTO public.menu_items (name, description, price, category_id, is_available) VALUES
    ('Espresso', 'Pure concentrated coffee shot', 3.25, (SELECT id FROM categories WHERE name = 'Hot Coffee' LIMIT 1), true);
  END IF;
  
  -- Iced Coffee items
  IF NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Iced Americano') THEN
    INSERT INTO public.menu_items (name, description, price, category_id, is_available) VALUES
    ('Iced Americano', 'Classic americano served over ice', 4.75, (SELECT id FROM categories WHERE name = 'Iced Coffee' LIMIT 1), true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Iced Latte') THEN
    INSERT INTO public.menu_items (name, description, price, category_id, is_available) VALUES
    ('Iced Latte', 'Chilled latte with cold milk', 5.50, (SELECT id FROM categories WHERE name = 'Iced Coffee' LIMIT 1), true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Cold Brew') THEN
    INSERT INTO public.menu_items (name, description, price, category_id, is_available) VALUES
    ('Cold Brew', 'Smooth cold-steeped coffee', 4.25, (SELECT id FROM categories WHERE name = 'Iced Coffee' LIMIT 1), true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Frappuccino') THEN
    INSERT INTO public.menu_items (name, description, price, category_id, is_available) VALUES
    ('Frappuccino', 'Blended iced coffee with whipped cream', 6.50, (SELECT id FROM categories WHERE name = 'Iced Coffee' LIMIT 1), true);
  END IF;
  
  -- Pastries
  IF NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Croissant') THEN
    INSERT INTO public.menu_items (name, description, price, category_id, is_available) VALUES
    ('Croissant', 'Buttery, flaky French pastry', 3.50, (SELECT id FROM categories WHERE name = 'Pastries' LIMIT 1), true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Muffin') THEN
    INSERT INTO public.menu_items (name, description, price, category_id, is_available) VALUES
    ('Muffin', 'Fresh baked blueberry muffin', 3.25, (SELECT id FROM categories WHERE name = 'Pastries' LIMIT 1), true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Danish') THEN
    INSERT INTO public.menu_items (name, description, price, category_id, is_available) VALUES
    ('Danish', 'Sweet pastry with fruit filling', 4.00, (SELECT id FROM categories WHERE name = 'Pastries' LIMIT 1), true);
  END IF;
  
  -- Sandwiches
  IF NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Breakfast Sandwich') THEN
    INSERT INTO public.menu_items (name, description, price, category_id, is_available) VALUES
    ('Breakfast Sandwich', 'Egg, cheese, and bacon on croissant', 7.50, (SELECT id FROM categories WHERE name = 'Sandwiches' LIMIT 1), true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Club Sandwich') THEN
    INSERT INTO public.menu_items (name, description, price, category_id, is_available) VALUES
    ('Club Sandwich', 'Triple decker with turkey and bacon', 9.25, (SELECT id FROM categories WHERE name = 'Sandwiches' LIMIT 1), true);
  END IF;
  
  -- Beverages  
  IF NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Orange Juice') THEN
    INSERT INTO public.menu_items (name, description, price, category_id, is_available) VALUES
    ('Orange Juice', 'Fresh squeezed orange juice', 3.75, (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Hot Tea') THEN
    INSERT INTO public.menu_items (name, description, price, category_id, is_available) VALUES
    ('Hot Tea', 'Selection of premium teas', 3.50, (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), true);
  END IF;
END $$;

-- Insert sample orders if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20250906-0001') THEN
    INSERT INTO public.orders (order_number, customer_name, subtotal, tax_amount, total_amount, status, payment_method) VALUES
    ('ORD-20250906-0001', 'Sarah Johnson', 10.50, 0.84, 11.34, 'completed', 'cash');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20250906-0002') THEN
    INSERT INTO public.orders (order_number, customer_name, subtotal, tax_amount, total_amount, status, payment_method) VALUES
    ('ORD-20250906-0002', 'Mike Chen', 4.75, 0.38, 5.13, 'completed', 'card');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20250906-0003') THEN
    INSERT INTO public.orders (order_number, customer_name, subtotal, tax_amount, total_amount, status, payment_method) VALUES
    ('ORD-20250906-0003', 'Lisa Park', 18.25, 1.46, 19.71, 'pending', NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20250906-0004') THEN
    INSERT INTO public.orders (order_number, customer_name, subtotal, tax_amount, total_amount, status, payment_method) VALUES
    ('ORD-20250906-0004', 'David Wilson', 9.00, 0.72, 9.72, 'in_progress', NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20250906-0005') THEN
    INSERT INTO public.orders (order_number, customer_name, subtotal, tax_amount, total_amount, status, payment_method) VALUES
    ('ORD-20250906-0005', 'Emma Davis', 7.75, 0.62, 8.37, 'ready', NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20250906-0006') THEN
    INSERT INTO public.orders (order_number, customer_name, subtotal, tax_amount, total_amount, status, payment_method) VALUES
    ('ORD-20250906-0006', 'James Brown', 6.25, 0.50, 6.75, 'pending', NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20250906-0007') THEN
    INSERT INTO public.orders (order_number, customer_name, subtotal, tax_amount, total_amount, status, payment_method) VALUES
    ('ORD-20250906-0007', 'Anna White', 15.50, 1.24, 16.74, 'in_progress', NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'ORD-20250906-0008') THEN
    INSERT INTO public.orders (order_number, customer_name, subtotal, tax_amount, total_amount, status, payment_method) VALUES
    ('ORD-20250906-0008', 'Robert Green', 11.75, 0.94, 12.69, 'ready', NULL);
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE IF EXISTS public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_status_history (only create if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order_status_history') THEN
    DROP POLICY IF EXISTS "Anyone can view order status history" ON public.order_status_history;
    CREATE POLICY "Anyone can view order status history" 
    ON public.order_status_history FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Staff can create order status history" ON public.order_status_history;
    CREATE POLICY "Staff can create order status history" 
    ON public.order_status_history FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- RLS policies for notifications (only create if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
    CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT 
    USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));
    
    DROP POLICY IF EXISTS "Anyone can create notifications" ON public.notifications;
    CREATE POLICY "Anyone can create notifications"
    ON public.notifications FOR INSERT 
    WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
    CREATE POLICY "Users can update their own notifications"  
    ON public.notifications FOR UPDATE
    USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));
  END IF;
END $$;