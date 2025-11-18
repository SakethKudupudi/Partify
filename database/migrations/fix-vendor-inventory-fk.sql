-- Fix vendor_inventory foreign key constraint
-- The foreign key should reference vendors(id), not vendors(user_id)

-- Step 1: Drop the incorrect foreign key constraint
ALTER TABLE vendor_inventory 
DROP CONSTRAINT IF EXISTS vendor_inventory_vendor_id_fkey;

-- Step 2: Add the correct foreign key constraint
ALTER TABLE vendor_inventory 
ADD CONSTRAINT vendor_inventory_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE;

-- Verify the fix
SELECT 
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  a.attname AS column_name,
  confrelid::regclass AS foreign_table_name,
  af.attname AS foreign_column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE conrelid = 'vendor_inventory'::regclass
  AND conname = 'vendor_inventory_vendor_id_fkey';
