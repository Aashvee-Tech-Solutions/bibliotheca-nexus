
-- Create app_role enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('user', 'admin');
    END IF;
END $$;

-- Helper function: update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Helper function: generate URL slug
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'),
                '\s+', '-', 'g'
            ),
            '^-+|-+$', '', 'g'
        )
    );
END;
$$;

-- Helper function: auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION public.trigger_generate_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.title) || '-' || EXTRACT(EPOCH FROM now())::int;
    END IF;
    RETURN NEW;
END;
$$;

-- Helper function: check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name public.app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = user_id
        AND user_roles.role = role_name
    );
END;
$$;

-- Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL USING (has_role(auth.uid(), 'admin'::public.app_role));
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table: user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT, INSERT, UPDATE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::public.app_role));
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: create profile and default role on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.email
    )
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Table: books
CREATE TABLE IF NOT EXISTS public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author_name TEXT,
  genre TEXT,
  description TEXT,
  cover_image_url TEXT,
  price NUMERIC(10,2),
  pages INTEGER,
  publication_date DATE,
  language TEXT,
  isbn TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT ALL ON public.books TO service_role;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active books" ON public.books;
CREATE POLICY "Anyone can view active books"
  ON public.books FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Admins can manage books" ON public.books;
CREATE POLICY "Admins can manage books"
  ON public.books FOR ALL USING (has_role(auth.uid(), 'admin'::public.app_role));
DROP TRIGGER IF EXISTS update_books_updated_at ON public.books;
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trigger_books_slug ON public.books;
CREATE TRIGGER trigger_books_slug
  BEFORE INSERT OR UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.trigger_generate_slug();
CREATE UNIQUE INDEX IF NOT EXISTS idx_books_slug ON public.books(slug);
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);

-- Table: upcoming_books
CREATE TABLE IF NOT EXISTS public.upcoming_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT,
  description TEXT,
  cover_image_url TEXT,
  total_author_positions INTEGER NOT NULL DEFAULT 1,
  available_positions INTEGER NOT NULL DEFAULT 1,
  price_per_position NUMERIC(10,2) NOT NULL DEFAULT 0,
  publication_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  copy_allocation JSONB DEFAULT '{"1": {"price": 16000, "copies": 2}, "2": {"price_structure": [10000, 9000], "copies": 4}, "3": {"price_structure": [8000, 7000, 6000], "copies": 6}, "4": {"price_structure": [7000, 6000, 5000, 4000], "copies": 8}}'::jsonb,
  position_pricing JSONB DEFAULT '[]'::jsonb,
  slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.upcoming_books TO authenticated;
GRANT ALL ON public.upcoming_books TO service_role;
ALTER TABLE public.upcoming_books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active upcoming books" ON public.upcoming_books;
CREATE POLICY "Anyone can view active upcoming books"
  ON public.upcoming_books FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Admins can manage upcoming books" ON public.upcoming_books;
CREATE POLICY "Admins can manage upcoming books"
  ON public.upcoming_books FOR ALL USING (has_role(auth.uid(), 'admin'::public.app_role));
DROP TRIGGER IF EXISTS update_upcoming_books_updated_at ON public.upcoming_books;
CREATE TRIGGER update_upcoming_books_updated_at
  BEFORE UPDATE ON public.upcoming_books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trigger_upcoming_books_slug ON public.upcoming_books;
CREATE TRIGGER trigger_upcoming_books_slug
  BEFORE INSERT OR UPDATE ON public.upcoming_books
  FOR EACH ROW EXECUTE FUNCTION public.trigger_generate_slug();
CREATE UNIQUE INDEX IF NOT EXISTS idx_upcoming_books_slug ON public.upcoming_books(slug);
CREATE INDEX IF NOT EXISTS idx_upcoming_books_status ON public.upcoming_books(status);
CREATE INDEX IF NOT EXISTS idx_upcoming_books_publication_date ON public.upcoming_books(publication_date);
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_total_positions_positive') THEN
        ALTER TABLE public.upcoming_books ADD CONSTRAINT check_total_positions_positive CHECK (total_author_positions > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_available_positions_positive') THEN
        ALTER TABLE public.upcoming_books ADD CONSTRAINT check_available_positions_positive CHECK (available_positions >= 0);
    END IF;
END $$;

-- Table: authorship_purchases
CREATE TABLE IF NOT EXISTS public.authorship_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upcoming_book_id UUID NOT NULL REFERENCES public.upcoming_books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  positions_purchased INTEGER NOT NULL DEFAULT 1,
  position_purchased INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_id TEXT,
  payment_method TEXT DEFAULT 'phonepe',
  phone_number TEXT,
  bio TEXT,
  profile_image_url TEXT,
  coupon_code TEXT,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  payment_details JSONB DEFAULT '{}'::jsonb,
  payment_initiated_at TIMESTAMP WITH TIME ZONE,
  payment_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.authorship_purchases TO authenticated;
GRANT ALL ON public.authorship_purchases TO service_role;
ALTER TABLE public.authorship_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.authorship_purchases;
CREATE POLICY "Users can view their own purchases"
  ON public.authorship_purchases FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own purchases" ON public.authorship_purchases;
CREATE POLICY "Users can create their own purchases"
  ON public.authorship_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own purchases" ON public.authorship_purchases;
CREATE POLICY "Users can update their own purchases"
  ON public.authorship_purchases FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all purchases" ON public.authorship_purchases;
CREATE POLICY "Admins can manage all purchases"
  ON public.authorship_purchases FOR ALL USING (has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX IF NOT EXISTS idx_authorship_purchases_user_id ON public.authorship_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_authorship_purchases_upcoming_book_id ON public.authorship_purchases(upcoming_book_id);
CREATE INDEX IF NOT EXISTS idx_authorship_purchases_payment_status ON public.authorship_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_authorship_purchases_payment_method ON public.authorship_purchases(payment_method);
CREATE INDEX IF NOT EXISTS idx_authorship_purchases_created_at ON public.authorship_purchases(created_at);
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_payment_status_valid') THEN
        ALTER TABLE public.authorship_purchases ADD CONSTRAINT check_payment_status_valid CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_payment_method_valid') THEN
        ALTER TABLE public.authorship_purchases ADD CONSTRAINT check_payment_method_valid CHECK (payment_method IN ('phonepe', 'cashfree', 'manual', 'other'));
    END IF;
END $$;
DROP TRIGGER IF EXISTS update_authorship_purchases_updated_at ON public.authorship_purchases;
CREATE TRIGGER update_authorship_purchases_updated_at
  BEFORE UPDATE ON public.authorship_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function: update available positions on upcoming book when purchase completed
CREATE OR REPLACE FUNCTION public.update_available_positions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
        UPDATE public.upcoming_books
        SET available_positions = GREATEST(available_positions - 1, 0)
        WHERE id = NEW.upcoming_book_id;
        NEW.payment_completed_at = now();
    END IF;

    IF NEW.payment_id IS NOT NULL AND OLD.payment_id IS NULL THEN
        NEW.payment_initiated_at = now();
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_book_positions_on_payment ON public.authorship_purchases;
CREATE TRIGGER update_book_positions_on_payment
  AFTER UPDATE ON public.authorship_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_available_positions();

-- Table: coupon_codes
CREATE TABLE IF NOT EXISTS public.coupon_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC(10,2) NOT NULL,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coupon_codes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupon_codes TO authenticated;
GRANT ALL ON public.coupon_codes TO service_role;
ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active coupon codes" ON public.coupon_codes;
CREATE POLICY "Anyone can view active coupon codes"
  ON public.coupon_codes FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
DROP POLICY IF EXISTS "Admins can manage coupon codes" ON public.coupon_codes;
CREATE POLICY "Admins can manage coupon codes"
  ON public.coupon_codes FOR ALL USING (has_role(auth.uid(), 'admin'::public.app_role));
DROP TRIGGER IF EXISTS update_coupon_codes_updated_at ON public.coupon_codes;
CREATE TRIGGER update_coupon_codes_updated_at
  BEFORE UPDATE ON public.coupon_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table: manuscripts
CREATE TABLE IF NOT EXISTS public.manuscripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT,
  synopsis TEXT,
  word_count INTEGER,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  manuscript_file_url TEXT,
  sample_pages_url TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.manuscripts TO authenticated;
GRANT ALL ON public.manuscripts TO service_role;
ALTER TABLE public.manuscripts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own manuscripts" ON public.manuscripts;
CREATE POLICY "Users can view their own manuscripts"
  ON public.manuscripts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can submit their own manuscripts" ON public.manuscripts;
CREATE POLICY "Users can submit their own manuscripts"
  ON public.manuscripts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all manuscripts" ON public.manuscripts;
CREATE POLICY "Admins can manage all manuscripts"
  ON public.manuscripts FOR ALL USING (has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX IF NOT EXISTS idx_manuscripts_user_id ON public.manuscripts(user_id);
CREATE INDEX IF NOT EXISTS idx_manuscripts_status ON public.manuscripts(status);
DROP TRIGGER IF EXISTS update_manuscripts_updated_at ON public.manuscripts;
CREATE TRIGGER update_manuscripts_updated_at
  BEFORE UPDATE ON public.manuscripts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table: payment_logs
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL,
  transaction_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  purchase_type TEXT DEFAULT 'authorship',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payment_logs TO authenticated;
GRANT ALL ON public.payment_logs TO service_role;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all payment logs" ON public.payment_logs;
CREATE POLICY "Admins can view all payment logs"
  ON public.payment_logs FOR SELECT USING (has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "System can insert payment logs" ON public.payment_logs;
CREATE POLICY "System can insert payment logs"
  ON public.payment_logs FOR INSERT WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_payment_logs_purchase_id ON public.payment_logs(purchase_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_transaction_id ON public.payment_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_event_type ON public.payment_logs(event_type);

-- Function: log payment events
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
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.payment_logs (purchase_id, transaction_id, event_type, event_data, purchase_type)
    VALUES (p_purchase_id, p_transaction_id, p_event_type, p_event_data, p_purchase_type);
END;
$$;

-- Trigger: log authorship purchase status changes
CREATE OR REPLACE FUNCTION public.log_authorship_payment_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    IF NEW.payment_status != OLD.payment_status THEN
        PERFORM public.log_payment_event(
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
            'authorship'
        );
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_authorship_payment_status ON public.authorship_purchases;
CREATE TRIGGER trigger_log_authorship_payment_status
  AFTER UPDATE ON public.authorship_purchases
  FOR EACH ROW EXECUTE FUNCTION public.log_authorship_payment_status();

-- Table: book_purchases
CREATE TABLE IF NOT EXISTS public.book_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'phonepe',
  payment_id TEXT,
  purchase_type TEXT NOT NULL DEFAULT 'direct_book',
  shipping_address JSONB DEFAULT '{}'::jsonb,
  payment_details JSONB DEFAULT '{}'::jsonb,
  payment_initiated_at TIMESTAMP WITH TIME ZONE,
  payment_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.book_purchases TO authenticated;
GRANT ALL ON public.book_purchases TO service_role;
ALTER TABLE public.book_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own book purchases" ON public.book_purchases;
CREATE POLICY "Users can view their own book purchases"
  ON public.book_purchases FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own book purchases" ON public.book_purchases;
CREATE POLICY "Users can insert their own book purchases"
  ON public.book_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own book purchases" ON public.book_purchases;
CREATE POLICY "Users can update their own book purchases"
  ON public.book_purchases FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all book purchases" ON public.book_purchases;
CREATE POLICY "Admins can view all book purchases"
  ON public.book_purchases FOR SELECT USING (has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can update all book purchases" ON public.book_purchases;
CREATE POLICY "Admins can update all book purchases"
  ON public.book_purchases FOR UPDATE USING (has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX IF NOT EXISTS idx_book_purchases_book_id ON public.book_purchases(book_id);
CREATE INDEX IF NOT EXISTS idx_book_purchases_user_id ON public.book_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_book_purchases_payment_status ON public.book_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_book_purchases_payment_method ON public.book_purchases(payment_method);
CREATE INDEX IF NOT EXISTS idx_book_purchases_created_at ON public.book_purchases(created_at);
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_book_payment_status_valid') THEN
        ALTER TABLE public.book_purchases ADD CONSTRAINT check_book_payment_status_valid CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_book_payment_method_valid') THEN
        ALTER TABLE public.book_purchases ADD CONSTRAINT check_book_payment_method_valid CHECK (payment_method IN ('phonepe', 'cashfree', 'manual', 'other'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_book_purchase_type_valid') THEN
        ALTER TABLE public.book_purchases ADD CONSTRAINT check_book_purchase_type_valid CHECK (purchase_type IN ('direct_book', 'bulk_order', 'subscription', 'gift'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_book_total_amount_positive') THEN
        ALTER TABLE public.book_purchases ADD CONSTRAINT check_book_total_amount_positive CHECK (total_amount > 0);
    END IF;
END $$;
DROP TRIGGER IF EXISTS update_book_purchases_updated_at ON public.book_purchases;
CREATE TRIGGER update_book_purchases_updated_at
  BEFORE UPDATE ON public.book_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger function: book purchase updated_at and timestamps
CREATE OR REPLACE FUNCTION public.update_book_purchase_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
        NEW.payment_completed_at = now();
    END IF;
    IF NEW.payment_id IS NOT NULL AND OLD.payment_id IS NULL THEN
        NEW.payment_initiated_at = now();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_book_purchase_updated_at ON public.book_purchases;
CREATE TRIGGER trigger_update_book_purchase_updated_at
  BEFORE UPDATE ON public.book_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_book_purchase_updated_at();

-- Trigger function: log book purchase status changes
CREATE OR REPLACE FUNCTION public.update_book_purchase_payment_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    IF NEW.payment_status != OLD.payment_status THEN
        PERFORM public.log_payment_event(
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

DROP TRIGGER IF EXISTS trigger_log_book_purchase_payment_status ON public.book_purchases;
CREATE TRIGGER trigger_log_book_purchase_payment_status
  AFTER UPDATE ON public.book_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_book_purchase_payment_status();

-- Analytics view combining authorship and book purchases (no RLS policy on views)
CREATE OR REPLACE VIEW public.payment_analytics AS
SELECT
  DATE_TRUNC('day', created_at) as payment_date,
  payment_method,
  payment_status,
  'authorship' as purchase_type,
  COUNT(*) as transaction_count,
  SUM(total_amount) as total_amount,
  AVG(total_amount) as avg_amount
FROM public.authorship_purchases
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
FROM public.book_purchases
GROUP BY DATE_TRUNC('day', created_at), payment_method, payment_status

ORDER BY payment_date DESC;

-- Backfill missing slugs for existing records
UPDATE public.books
SET slug = generate_slug(title) || '-' || EXTRACT(EPOCH FROM created_at)::int
WHERE slug IS NULL OR slug = '';

UPDATE public.upcoming_books
SET slug = generate_slug(title) || '-' || EXTRACT(EPOCH FROM created_at)::int
WHERE slug IS NULL OR slug = '';

-- Ensure admin emails are marked as admin (run idempotently)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'mis@aashveetech.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'info@aashveetech.com'
ON CONFLICT (user_id, role) DO NOTHING;
