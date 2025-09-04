-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.validate_menu_item_size()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if Hot Coffee category, size must be 8oz
  IF EXISTS (
    SELECT 1 FROM categories 
    WHERE id = NEW.category_id AND name = 'Hot Coffee'
  ) THEN
    NEW.size = '8oz';
  ELSE
    -- For other categories, size must be 16oz or 22oz
    IF NEW.size NOT IN ('16oz', '22oz') THEN
      NEW.size = '16oz'; -- Default to 16oz if invalid
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;