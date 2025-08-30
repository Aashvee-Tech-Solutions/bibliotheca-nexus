-- Add position_purchased column to track specific position purchased
ALTER TABLE public.authorship_purchases 
ADD COLUMN position_purchased integer DEFAULT 1;

-- Add position_pricing column to upcoming_books to store individual position prices
ALTER TABLE public.upcoming_books 
ADD COLUMN position_pricing jsonb DEFAULT '[]'::jsonb;

-- Create trigger to update available positions when payment is completed
CREATE OR REPLACE FUNCTION public.update_available_positions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    UPDATE upcoming_books 
    SET available_positions = available_positions - 1
    WHERE id = NEW.upcoming_book_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger
CREATE TRIGGER update_book_positions_on_payment
  AFTER UPDATE ON public.authorship_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_available_positions();