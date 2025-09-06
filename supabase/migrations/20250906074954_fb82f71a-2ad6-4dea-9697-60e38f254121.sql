-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user roles enum (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'admin', 'cashier', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create order status enum (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'ready', 'completed', 'cancelled', 'refunded', 'voided');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create categories table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create menu_items table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category_id uuid,
  price numeric NOT NULL,
  size text,
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create customer_orders table
CREATE TABLE IF NOT EXISTS public.customer_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text NOT NULL,
  customer_name text NOT NULL,
  customer_contact text,
  special_instructions text,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  payment_method text,
  placed_at timestamp with time zone NOT NULL DEFAULT now(),
  accepted_at timestamp with time zone,
  ready_at timestamp with time zone,
  completed_at timestamp with time zone,
  staff_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create customer_order_items table
CREATE TABLE IF NOT EXISTS public.customer_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_order_id uuid NOT NULL,
  menu_item_id uuid NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  modifications text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create order_status_history table
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL,
  status order_status NOT NULL,
  changed_by_user_id uuid,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  message text NOT NULL,
  order_id uuid,
  user_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create inventory table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id uuid NOT NULL,
  current_stock integer NOT NULL DEFAULT 0,
  min_stock_level integer NOT NULL DEFAULT 5,
  max_stock_level integer NOT NULL DEFAULT 100,
  cost_per_unit numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'pieces',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create orders table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text NOT NULL,
  customer_name text,
  cashier_id uuid,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  payment_method text,
  status order_status NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

-- Create order_items table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL,
  menu_item_id uuid NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create activity_logs table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  table_name text,
  action text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default categories (only if they don't exist)
INSERT INTO public.categories (name, description) 
SELECT name, description FROM (VALUES 
  ('Cheese Cake Series', 'Delicious cheese cakes in various flavors'),
  ('Chill Drinks', 'Refreshing cold beverages'),
  ('Cold Coffee', 'Iced coffee drinks'),
  ('Greenland', 'Fresh and healthy green drinks'),
  ('Hot Coffee', 'Warm coffee beverages'),
  ('Rice Meal', 'Complete rice meals and dishes')
) AS v(name, description)
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE categories.name = v.name);

-- Create sequences for order numbers
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;
CREATE SEQUENCE IF NOT EXISTS customer_order_sequence START 1;

-- Create function to generate customer order numbers
CREATE OR REPLACE FUNCTION public.generate_customer_order_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.order_number = 'CUST-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('customer_order_sequence')::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'staff'
  );
  RETURN NEW;
END;
$$;

-- Create triggers (only if they don't exist)
DROP TRIGGER IF EXISTS generate_customer_order_number_trigger ON public.customer_orders;
CREATE TRIGGER generate_customer_order_number_trigger
  BEFORE INSERT ON public.customer_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_customer_order_number();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on new tables
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables

-- Customer orders policies (public orders from customers)
DROP POLICY IF EXISTS "Anyone can create customer orders" ON public.customer_orders;
CREATE POLICY "Anyone can create customer orders" ON public.customer_orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view customer orders" ON public.customer_orders;
CREATE POLICY "Anyone can view customer orders" ON public.customer_orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can update customer orders" ON public.customer_orders;
CREATE POLICY "Staff can update customer orders" ON public.customer_orders FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner', 'cashier', 'staff')
  )
);

-- Customer order items policies
DROP POLICY IF EXISTS "Anyone can create customer order items" ON public.customer_order_items;
CREATE POLICY "Anyone can create customer order items" ON public.customer_order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view customer order items" ON public.customer_order_items;
CREATE POLICY "Anyone can view customer order items" ON public.customer_order_items FOR SELECT USING (true);

-- Order status history policies
DROP POLICY IF EXISTS "Staff can view order status history" ON public.order_status_history;
CREATE POLICY "Staff can view order status history" ON public.order_status_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner', 'cashier', 'staff')
  )
);

DROP POLICY IF EXISTS "Staff can create order status history" ON public.order_status_history;
CREATE POLICY "Staff can create order status history" ON public.order_status_history FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner', 'cashier', 'staff')
  )
);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime for customer orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;