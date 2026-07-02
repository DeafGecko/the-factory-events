-- Add RSVP deadline to QR codes (unix timestamp; NULL = no deadline)
ALTER TABLE event_qr_codes ADD COLUMN deadline INTEGER;
