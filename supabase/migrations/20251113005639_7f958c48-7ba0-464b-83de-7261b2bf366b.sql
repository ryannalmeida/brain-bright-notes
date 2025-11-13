-- Add favorite column to notes table
ALTER TABLE public.notes 
ADD COLUMN favorite BOOLEAN NOT NULL DEFAULT false;

-- Create index for better query performance on favorites
CREATE INDEX idx_notes_favorite ON public.notes(favorite) WHERE favorite = true;