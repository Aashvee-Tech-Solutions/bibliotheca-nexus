-- Enhanced payment system migration
-- Add better payment tracking and PhonePe integration

-- Add missing columns to authorship_purchases if they don't exist
DO $$ 
BEGIN
    -- Add position_purchased column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorship_purchases' AND column_name = 'position_purchased') THEN
        ALTER TABLE authorship_purchases ADD COLUMN position_purchased INTEGER NOT NULL DEFAULT 1;
    END IF;
    
    -- Add payment_details column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorship_purchases' AND column_name = 'payment_details') THEN
        ALTER TABLE authorship_purchases ADD COLUMN payment_details JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add payment_method column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorship_purchases' AND column_name = 'payment_method') THEN
        ALTER TABLE authorship_purchases ADD COLUMN payment_method TEXT DEFAULT 'phonepe';
    END IF;
    
    -- Add payment_initiated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorship_purchases' AND column_name = 'payment_initiated_at') THEN
        ALTER TABLE authorship_purchases ADD COLUMN payment_initiated_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add payment_completed_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'authorship_purchases' AND column_name = 'payment_completed_at') THEN
        ALTER TABLE authorship_purchases ADD COLUMN payment_completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create payment_logs table for tracking all payment events
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES public.authorship_purchases(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'initiated', 'webhook_received', 'completed', 'failed', 'refunded'
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payment_logs
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_logs
CREATE POLICY IF NOT EXISTS "Admins can view all payment logs" 
ON public.payment_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY IF NOT EXISTS "System can insert payment logs" 
ON public.payment_logs 
FOR INSERT 
WITH CHECK (true); -- Allow system inserts via service role

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_logs_purchase_id ON payment_logs(purchase_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_transaction_id ON payment_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_event_type ON payment_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_authorship_purchases_payment_method ON authorship_purchases(payment_method);

-- Create function to log payment events
CREATE OR REPLACE FUNCTION public.log_payment_event(
  p_purchase_id UUID,
  p_transaction_id TEXT,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO payment_logs (purchase_id, transaction_id, event_type, event_data)
  VALUES (p_purchase_id, p_transaction_id, p_event_type, p_event_data);
END;
$$;

-- Update the trigger function to log payment status changes
CREATE OR REPLACE FUNCTION public.update_available_positions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
        'timestamp', NOW()
      )
    );
  END IF;

  -- Update available positions when payment is completed
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    UPDATE upcoming_books 
    SET available_positions = available_positions - NEW.positions_purchased
    WHERE id = NEW.upcoming_book_id;
    
    -- Set payment completed timestamp
    NEW.payment_completed_at = NOW();
  END IF;
  
  -- Set payment initiated timestamp if payment_id is set and wasn't set before
  IF NEW.payment_id IS NOT NULL AND OLD.payment_id IS NULL THEN
    NEW.payment_initiated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add constraint to ensure payment_status is valid
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_payment_status_valid'
  ) THEN
    ALTER TABLE authorship_purchases 
    ADD CONSTRAINT check_payment_status_valid 
    CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled'));
  END IF;
END $$;

-- Add constraint to ensure payment_method is valid
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_payment_method_valid'
  ) THEN
    ALTER TABLE authorship_purchases 
    ADD CONSTRAINT check_payment_method_valid 
    CHECK (payment_method IN ('phonepe', 'cashfree', 'manual', 'other'));
  END IF;
END $$;

-- Create view for payment analytics (admin use)
CREATE OR REPLACE VIEW public.payment_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as payment_date,
  payment_method,
  payment_status,
  COUNT(*) as transaction_count,
  SUM(total_amount) as total_amount,
  AVG(total_amount) as avg_amount
FROM authorship_purchases 
GROUP BY DATE_TRUNC('day', created_at), payment_method, payment_status
ORDER BY payment_date DESC;

-- Grant access to payment analytics view for admins
CREATE POLICY IF NOT EXISTS "Admins can view payment analytics" 
ON public.payment_analytics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));
