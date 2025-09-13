-- Only add foreign keys if they don't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_order_items_order'
  ) THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT fk_order_items_order
      FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_order_items_menu_item'
  ) THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT fk_order_items_menu_item
      FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- Create essential triggers if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_orders_generate_number'
  ) THEN
    CREATE TRIGGER trg_orders_generate_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_order_number();
  END IF;
END $$;

-- Relax orders update policy for demo functionality
DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;
CREATE POLICY "Anyone can update orders"
ON public.orders
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Insert sample data only if tables are empty
INSERT INTO public.categories (name, description, is_active)
SELECT 'Hot Coffee', 'Brewed hot coffee', true
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Hot Coffee');

INSERT INTO public.categories (name, description, is_active)
SELECT 'Iced Drinks', 'Iced beverages', true
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Iced Drinks');

INSERT INTO public.categories (name, description, is_active)
SELECT 'Pastries', 'Bakery items', true
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Pastries');

-- Get category IDs for sample menu items
DO $$
DECLARE
  hot_coffee_id UUID;
  iced_drinks_id UUID;
  pastries_id UUID;
BEGIN
  SELECT id INTO hot_coffee_id FROM public.categories WHERE name = 'Hot Coffee' LIMIT 1;
  SELECT id INTO iced_drinks_id FROM public.categories WHERE name = 'Iced Drinks' LIMIT 1;
  SELECT id INTO pastries_id FROM public.categories WHERE name = 'Pastries' LIMIT 1;

  -- Insert sample menu items only if they don't exist
  INSERT INTO public.menu_items (name, price, description, category_id, size, is_available)
  SELECT 'Americano', 3.50, 'Hot Americano', hot_coffee_id, '8oz', true
  WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE name = 'Americano');

  INSERT INTO public.menu_items (name, price, description, category_id, size, is_available)
  SELECT 'Iced Latte', 4.50, 'Chilled latte', iced_drinks_id, '16oz', true
  WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE name = 'Iced Latte');

  INSERT INTO public.menu_items (name, price, description, category_id, size, is_available)
  SELECT 'Croissant', 2.75, 'Buttery croissant', pastries_id, NULL, true
  WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE name = 'Croissant');

  -- Insert sample order with items if no orders exist
  IF NOT EXISTS (SELECT 1 FROM public.orders) THEN
    WITH new_order AS (
      INSERT INTO public.orders (customer_name, subtotal, tax_amount, total_amount, status, payment_method, created_at)
      VALUES ('Walk-in Customer', 10.75, 0.86, 11.61, 'completed', 'cash', now() - interval '1 day')
      RETURNING id
    ),
    menu_items_data AS (
      SELECT id, name, price FROM public.menu_items WHERE name IN ('Americano', 'Iced Latte', 'Croissant')
    )
    INSERT INTO public.order_items (order_id, menu_item_id, quantity, unit_price, total_price)
    SELECT 
      new_order.id,
      menu_items_data.id,
      1,
      menu_items_data.price,
      menu_items_data.price
    FROM new_order, menu_items_data;
  END IF;
END $$;