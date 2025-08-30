-- Fix production issues and add missing database optimizations

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_upcoming_books_status ON upcoming_books(status);
CREATE INDEX IF NOT EXISTS idx_upcoming_books_publication_date ON upcoming_books(publication_date);
CREATE INDEX IF NOT EXISTS idx_authorship_purchases_user_id ON authorship_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_authorship_purchases_upcoming_book_id ON authorship_purchases(upcoming_book_id);
CREATE INDEX IF NOT EXISTS idx_authorship_purchases_payment_status ON authorship_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_manuscripts_user_id ON manuscripts(user_id);
CREATE INDEX IF NOT EXISTS idx_manuscripts_status ON manuscripts(status);

-- Add missing position_pricing column to upcoming_books if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'upcoming_books' AND column_name = 'position_pricing') THEN
        ALTER TABLE upcoming_books ADD COLUMN position_pricing jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Add slug column for SEO-friendly URLs
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'upcoming_books' AND column_name = 'slug') THEN
        ALTER TABLE upcoming_books ADD COLUMN slug text;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_upcoming_books_slug ON upcoming_books(slug);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'slug') THEN
        ALTER TABLE books ADD COLUMN slug text;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
    END IF;
END $$;

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title text)
RETURNS text AS $$
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
$$ LANGUAGE plpgsql;

-- Update existing records with slugs
UPDATE upcoming_books 
SET slug = generate_slug(title) || '-' || EXTRACT(EPOCH FROM created_at)::int
WHERE slug IS NULL;

UPDATE books 
SET slug = generate_slug(title) || '-' || EXTRACT(EPOCH FROM created_at)::int
WHERE slug IS NULL;

-- Trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION trigger_generate_slug()
RETURNS trigger AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.title) || '-' || EXTRACT(EPOCH FROM now())::int;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for auto-slug generation
DROP TRIGGER IF EXISTS trigger_upcoming_books_slug ON upcoming_books;
CREATE TRIGGER trigger_upcoming_books_slug
    BEFORE INSERT OR UPDATE ON upcoming_books
    FOR EACH ROW EXECUTE FUNCTION trigger_generate_slug();

DROP TRIGGER IF EXISTS trigger_books_slug ON books;
CREATE TRIGGER trigger_books_slug
    BEFORE INSERT OR UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION trigger_generate_slug();

-- Fix any data inconsistencies
UPDATE upcoming_books 
SET available_positions = total_author_positions 
WHERE available_positions IS NULL;

-- Add proper constraints
ALTER TABLE upcoming_books 
ADD CONSTRAINT check_available_positions_positive 
CHECK (available_positions >= 0);

ALTER TABLE upcoming_books 
ADD CONSTRAINT check_total_positions_positive 
CHECK (total_author_positions > 0);