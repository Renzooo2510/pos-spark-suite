-- Simple migration to add missing status values
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'ready';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'refunded';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'voided';