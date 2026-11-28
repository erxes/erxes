-- Portals pick their email From and Reply-To, their SMS connection and their code messages, and may offer texted codes beside verify.mn. A portal on verify.mn keeps only it until a member turns texted codes on.
SELECT set_config('app.system', 'on', true);
--> statement-breakpoint
ALTER TABLE "core_portals" ADD COLUMN "phone_texts" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "core_portals" ADD COLUMN "sms_connection_id" text;--> statement-breakpoint
ALTER TABLE "core_portals" ADD COLUMN "from_email" text;--> statement-breakpoint
ALTER TABLE "core_portals" ADD COLUMN "reply_to" text;--> statement-breakpoint
ALTER TABLE "core_portals" ADD COLUMN "code_language" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "core_portals" ADD COLUMN "code_email_subject" text;--> statement-breakpoint
ALTER TABLE "core_portals" ADD COLUMN "code_email_body" text;--> statement-breakpoint
ALTER TABLE "core_portals" ADD COLUMN "code_sms_text" text;--> statement-breakpoint
ALTER TABLE "core_portals" ADD CONSTRAINT "core_portals_sms_connection_id_fkey" FOREIGN KEY ("sms_connection_id") REFERENCES "public"."core_integration_connections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_portals" ADD CONSTRAINT "core_portals_code_language_check" CHECK ("core_portals"."code_language" IN ('en', 'mn'));--> statement-breakpoint
UPDATE "core_portals" SET "phone_texts" = false WHERE "phone_connection_id" IS NOT NULL;
