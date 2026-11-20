ALTER TABLE "core_email_addresses" ADD COLUMN "sent_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "core_email_addresses" ADD COLUMN "last_sent_at" timestamp with time zone;--> statement-breakpoint
-- Addresses emailed before the record counted sends, from the delivery log.
INSERT INTO core_email_addresses (id, org_id, email, sent_count, last_sent_at)
SELECT substr(md5(random()::text || d.org_id || lower(d."to")), 1, 17), d.org_id, lower(d."to"), count(*), max(d.sent_at)
FROM core_email_deliveries d
WHERE d.sent_at IS NOT NULL
GROUP BY d.org_id, lower(d."to")
ON CONFLICT (org_id, email) DO UPDATE SET sent_count = excluded.sent_count, last_sent_at = excluded.last_sent_at;