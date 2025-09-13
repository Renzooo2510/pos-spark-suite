-- Add missing foreign keys to enable relational queries and integrity
ALTER TABLE IF EXISTS public.order_items
  ADD CONSTRAINT fk_order_items_order
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.order_items
  ADD CONSTRAINT fk_order_items_menu_item
  FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public.menu_items
  ADD CONSTRAINT fk_menu_items_category
  FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.inventory
  ADD CONSTRAINT fk_inventory_menu_item
  FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;

-- Create triggers for order number generation and updated_at maintenance
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_orders_updated_at'
  ) THEN
    CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Ensure menu item size validation trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_menu_item_size'
  ) THEN
    CREATE TRIGGER trg_menu_item_size
    BEFORE INSERT OR UPDATE ON public.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_menu_item_size();
  END IF;
END $$;

-- Seed sample categories
INSERT INTO public.categories (id, name, description, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Hot Coffee', 'Brewed hot coffee', true),
  ('00000000-0000-0000-0000-000000000002', 'Iced Drinks', 'Iced beverages', true),
  ('00000000-0000-0000-0000-000000000003', 'Pastries', 'Bakery items', true)
ON CONFLICT (id) DO NOTHING;

-- Seed sample menu items
INSERT INTO public.menu_items (id, name, price, description, category_id, size, is_available)
VALUES
  ('00000000-0000-0000-0000-000000000101','Americano',3.50,'Hot Americano','00000000-0000-0000-0000-000000000001','8oz', true),
  ('00000000-0000-0000-0000-000000000102','Iced Latte',4.50,'Chilled latte','00000000-0000-0000-0000-000000000002','16oz', true),
  ('00000000-0000-0000-0000-000000000103','Croissant',2.75,'Buttery croissant','00000000-0000-0000-0000-000000000003', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Seed a sample completed order with items (only if there are no orders yet)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.orders) THEN
    WITH new_order AS (
      INSERT INTO public.orders (customer_name, subtotal, tax_amount, total_amount, status, payment_method)
      VALUES ('Walk-in', 10.75, 0.86, 11.61, 'completed', 'cash')
      RETURNING id
    )
    INSERT INTO public.order_items (order_id, menu_item_id, quantity, unit_price, total_price)
    SELECT id, '00000000-0000-0000-0000-000000000101', 1, 3.50, 3.50 FROM new_order
    UNION ALL
    SELECT id, '00000000-0000-0000-0000-000000000102', 1, 4.50, 4.50 FROM new_order
    UNION ALL
    SELECT id, '00000000-0000-0000-0000-000000000103', 1, 2.75, 2.75 FROM new_order;
  END IF;
END $$;

-- Relax update policy so status changes work in preview/demo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='orders' AND policyname='Anyone can update orders'
  ) THEN
    CREATE POLICY "Anyone can update orders"
    ON public.orders
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;
