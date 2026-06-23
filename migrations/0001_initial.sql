-- Payments log (links to Sanity Booking ID)
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  sanity_booking_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- QR Scan logs
CREATE TABLE IF NOT EXISTS qr_scans (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  sanity_event_id TEXT NOT NULL,
  scanned_by TEXT,
  scanned_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  event_type TEXT NOT NULL,
  session_id TEXT,
  metadata TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Email logs
CREATE TABLE IF NOT EXISTS email_logs (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  newsletter_id TEXT,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(sanity_booking_id);
CREATE INDEX IF NOT EXISTS idx_qr_event ON qr_scans(sanity_event_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
