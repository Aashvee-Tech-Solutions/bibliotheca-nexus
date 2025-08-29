-- Fix function search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;

-- Create upcoming books table for authorship marketplace
CREATE TABLE public.upcoming_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT,
  description TEXT,
  cover_image_url TEXT,
  total_author_positions INTEGER NOT NULL DEFAULT 1,
  available_positions INTEGER NOT NULL DEFAULT 1,
  price_per_position NUMERIC(10,2) NOT NULL,
  publication_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on upcoming_books
ALTER TABLE public.upcoming_books ENABLE ROW LEVEL SECURITY;

-- Create policies for upcoming_books
CREATE POLICY "Anyone can view upcoming books" 
ON public.upcoming_books 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Admins can manage upcoming books" 
ON public.upcoming_books 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create authorship purchases table
CREATE TABLE public.authorship_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upcoming_book_id UUID NOT NULL REFERENCES public.upcoming_books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  positions_purchased INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_id TEXT,
  phone_number TEXT,
  bio TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on authorship_purchases
ALTER TABLE public.authorship_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for authorship_purchases
CREATE POLICY "Users can view their own purchases" 
ON public.authorship_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases" 
ON public.authorship_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases" 
ON public.authorship_purchases 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all purchases" 
ON public.authorship_purchases 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for upcoming_books updated_at
CREATE TRIGGER update_upcoming_books_updated_at
BEFORE UPDATE ON public.upcoming_books
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for authorship_purchases updated_at
CREATE TRIGGER update_authorship_purchases_updated_at
BEFORE UPDATE ON public.authorship_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update available positions when purchase is made
CREATE OR REPLACE FUNCTION public.update_available_positions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    UPDATE upcoming_books 
    SET available_positions = available_positions - NEW.positions_purchased
    WHERE id = NEW.upcoming_book_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update available positions
CREATE TRIGGER update_positions_on_payment
AFTER UPDATE ON public.authorship_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_available_positions();