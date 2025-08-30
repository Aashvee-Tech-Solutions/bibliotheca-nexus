-- Add coupon codes table
CREATE TABLE public.coupon_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value NUMERIC NOT NULL,
  max_uses INTEGER DEFAULT NULL, -- NULL means unlimited
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT
);

-- Enable RLS
ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for coupon codes
CREATE POLICY "Admins can manage coupon codes" 
ON public.coupon_codes 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active coupon codes" 
ON public.coupon_codes 
FOR SELECT 
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Add coupon_code field to authorship_purchases
ALTER TABLE public.authorship_purchases 
ADD COLUMN coupon_code TEXT,
ADD COLUMN discount_amount NUMERIC DEFAULT 0,
ADD COLUMN payment_details JSONB DEFAULT '{}';

-- Add copy_allocation field to upcoming_books for pricing structure
ALTER TABLE public.upcoming_books 
ADD COLUMN copy_allocation JSONB DEFAULT '{"1": {"price": 16000, "copies": 2}, "2": {"price_structure": [10000, 9000], "copies": 4}, "3": {"price_structure": [8000, 7000, 6000], "copies": 6}, "4": {"price_structure": [7000, 6000, 5000, 4000], "copies": 8}}';

-- Create trigger for automatic timestamp updates on coupon_codes
CREATE TRIGGER update_coupon_codes_updated_at
BEFORE UPDATE ON public.coupon_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();