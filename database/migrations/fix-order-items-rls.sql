-- Fix RLS policies for order_items table
-- This script adds the missing RLS policies to allow customers to view their order items

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Customers can view their order items" ON order_items;
DROP POLICY IF EXISTS "Customers can create order items" ON order_items;

-- Add policies to allow customers to view their order items
CREATE POLICY "Customers can view their order items"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE customer_id = auth.uid()
    )
  );

-- Allow vendors to view order items for their inventory
CREATE POLICY "Vendors can view order items for their inventory"
  ON order_items FOR SELECT
  USING (
    vendor_id = auth.uid()
  );

-- Allow admins to view all order items
CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );
