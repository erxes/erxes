ALTER TABLE "core_portals" ADD COLUMN "mail_connection_id" text;--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD COLUMN "mail_connection_id" text;--> statement-breakpoint
ALTER TABLE "core_email_deliveries" ADD COLUMN "connection_id" text;--> statement-breakpoint
ALTER TABLE "core_portals" ADD CONSTRAINT "core_portals_mail_connection_id_fkey" FOREIGN KEY ("mail_connection_id") REFERENCES "public"."core_integration_connections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD CONSTRAINT "core_broadcasts_mail_connection_id_fkey" FOREIGN KEY ("mail_connection_id") REFERENCES "public"."core_integration_connections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_email_deliveries" ADD CONSTRAINT "core_email_deliveries_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "public"."core_integration_connections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_email_deliveries_connection_idx" ON "core_email_deliveries" USING btree ("connection_id") WHERE "core_email_deliveries"."connection_id" is not null;