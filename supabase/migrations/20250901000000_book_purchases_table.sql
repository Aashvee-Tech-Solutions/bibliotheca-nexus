-- Create book_purchases table for direct book purchases
-- This is separate from authorship_purchases which is for co-authorship positions

CREATE TABLE IF NOT EXISTS public.book_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'phonepe',
  payment_id TEXT,
  purchase_type TEXT NOT NULL DEFAULT 'direct_book', -- 'direct_book', 'bulk_order', etc.
  shipping_address JSONB DEFAULT '{}'::jsonb,
  payment_details JSONB DEFAULT '{}'::jsonb,
  payment_initiated_at TIMESTAMP WITH TIME ZONE,
  payment_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.book_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for book_purchases
CREATE POLICY IF NOT EXISTS "Users can view their own book purchases" 
ON public.book_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own book purchases" 
ON public.book_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own book purchases" 
ON public.book_purchases 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Admins can view all book purchases" 
ON public.book_purchases 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY IF NOT EXISTS "Admins can update all book purchases" 
ON public.book_purchases 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_book_purchases_book_id ON book_purchases(book_id);
CREATE INDEX IF NOT EXISTS idx_book_purchases_user_id ON book_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_book_purchases_payment_status ON book_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_book_purchases_payment_method ON book_purchases(payment_method);
CREATE INDEX IF NOT EXISTS idx_book_purchases_created_at ON book_purchases(created_at);

-- Add constraints for validation
ALTER TABLE book_purchases 
ADD CONSTRAINT check_book_payment_status_valid 
CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled'));

ALTER TABLE book_purchases 
ADD CONSTRAINT check_book_payment_method_valid 
CHECK (payment_method IN ('phonepe', 'cashfree', 'manual', 'other'));

ALTER TABLE book_purchases 
ADD CONSTRAINT check_book_purchase_type_valid 
CHECK (purchase_type IN ('direct_book', 'bulk_order', 'subscription', 'gift'));

ALTER TABLE book_purchases 
ADD CONSTRAINT check_book_total_amount_positive 
CHECK (total_amount > 0);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_book_purchase_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Set payment completed timestamp when status changes to completed
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    NEW.payment_completed_at = NOW();
  END IF;
  
  -- Set payment initiated timestamp if payment_id is set and wasn't set before
  IF NEW.payment_id IS NOT NULL AND OLD.payment_id IS NULL THEN
    NEW.payment_initiated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER IF NOT EXISTS trigger_update_book_purchase_updated_at
BEFORE UPDATE ON public.book_purchases
FOR EACH ROW EXECUTE FUNCTION public.update_book_purchase_updated_at();

-- Extend payment_logs to also handle book purchases
-- Update payment_logs table to handle both authorship and book purchases
ALTER TABLE public.payment_logs 
DROP CONSTRAINT IF EXISTS payment_logs_purchase_id_fkey;

-- Add purchase_type to payment_logs to distinguish between authorship and book purchases
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_logs' AND column_name = 'purchase_type') THEN
        ALTER TABLE payment_logs ADD COLUMN purchase_type TEXT DEFAULT 'authorship';
    END IF;
END $$;

-- Update the log_payment_event function to handle book purchases
CREATE OR REPLACE FUNCTION public.log_payment_event(
  p_purchase_id UUID,
  p_transaction_id TEXT,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'::jsonb,
  p_purchase_type TEXT DEFAULT 'authorship'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO payment_logs (purchase_id, transaction_id, event_type, event_data, purchase_type)
  VALUES (p_purchase_id, p_transaction_id, p_event_type, p_event_data, p_purchase_type);
END;
$$;

-- Create trigger for book purchase payment logging
CREATE OR REPLACE FUNCTION public.update_book_purchase_payment_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log payment status change
  IF NEW.payment_status != OLD.payment_status THEN
    PERFORM log_payment_event(
      NEW.id,
      COALESCE(NEW.payment_id, 'unknown'),
      CASE 
        WHEN NEW.payment_status = 'completed' THEN 'payment_completed'
        WHEN NEW.payment_status = 'failed' THEN 'payment_failed'
        WHEN NEW.payment_status = 'pending' THEN 'payment_pending'
        ELSE 'payment_status_changed'
      END,
      jsonb_build_object(
        'old_status', OLD.payment_status,
        'new_status', NEW.payment_status,
        'payment_method', NEW.payment_method,
        'total_amount', NEW.total_amount,
        'timestamp', NOW()
      ),
      'book'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER IF NOT EXISTS trigger_log_book_purchase_payment_status
AFTER UPDATE ON public.book_purchases
FOR EACH ROW EXECUTE FUNCTION public.update_book_purchase_payment_status();

-- Update payment analytics view to include book purchases
CREATE OR REPLACE VIEW public.payment_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as payment_date,
  payment_method,
  payment_status,
  'authorship' as purchase_type,
  COUNT(*) as transaction_count,
  SUM(total_amount) as total_amount,
  AVG(total_amount) as avg_amount
FROM authorship_purchases 
GROUP BY DATE_TRUNC('day', created_at), payment_method, payment_status

UNION ALL

SELECT 
  DATE_TRUNC('day', created_at) as payment_date,
  payment_method,
  payment_status,
  'book' as purchase_type,
  COUNT(*) as transaction_count,
  SUM(total_amount) as total_amount,
  AVG(total_amount) as avg_amount
FROM book_purchases 
GROUP BY DATE_TRUNC('day', created_at), payment_method, payment_status

ORDER BY payment_date DESC;
