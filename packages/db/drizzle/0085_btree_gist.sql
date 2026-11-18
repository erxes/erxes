-- Plugins may not create extensions, so core provides those their tables use: btree_gist lets an
-- exclusion constraint compare text and numbers with =, beside ranges with && (no overlapping bookings).
CREATE EXTENSION IF NOT EXISTS btree_gist;
