-- First, let's add the size field to menu_items table
ALTER TABLE public.menu_items ADD COLUMN size TEXT;

-- Insert the specific categories you requested
INSERT INTO public.categories (name, description, is_active) VALUES
('Cheese Cake Series', 'Delicious cheese cake varieties', true),
('Chill Drinks', 'Refreshing cold beverages', true),
('Cold Coffee', 'Iced coffee beverages', true),
('Greenland', 'Greenland specialty items', true),
('Hot Coffee', 'Hot coffee beverages (8oz only)', true),
('Rice Meal', 'Complete rice meal options', true)
ON CONFLICT (name) DO NOTHING;

-- Update menu_items to use category_id properly and add constraint for size based on category
CREATE OR REPLACE FUNCTION validate_menu_item_size()
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
$$ LANGUAGE plpgsql;

-- Create trigger for size validation
CREATE TRIGGER validate_size_trigger
  BEFORE INSERT OR UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION validate_menu_item_size();