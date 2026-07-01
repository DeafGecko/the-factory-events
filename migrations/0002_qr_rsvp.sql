-- QR codes generated per booking
CREATE TABLE IF NOT EXISTS event_qr_codes (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Guest RSVP submissions
CREATE TABLE IF NOT EXISTS rsvp_registrations (
  id TEXT PRIMARY KEY,
  qr_token TEXT NOT NULL,
  booking_id TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  party_size INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  submitted_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_qr_token ON event_qr_codes(token);
CREATE INDEX IF NOT EXISTS idx_rsvp_token ON rsvp_registrations(qr_token);
CREATE INDEX IF NOT EXISTS idx_rsvp_booking ON rsvp_registrations(booking_id);
