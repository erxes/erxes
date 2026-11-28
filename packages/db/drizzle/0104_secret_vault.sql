CREATE TABLE "core_secrets" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"owner" text NOT NULL,
	"key_id" text NOT NULL,
	"sealed" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core_users" ADD COLUMN "totp_secret_id" text;--> statement-breakpoint
ALTER TABLE "core_users" ADD COLUMN "totp_pending_secret_id" text;--> statement-breakpoint
ALTER TABLE "core_file_buckets" ADD COLUMN "secret_id" text;--> statement-breakpoint
ALTER TABLE "core_webhooks" ADD COLUMN "secret_id" text;--> statement-breakpoint
ALTER TABLE "core_payment_gateways" ADD COLUMN "config_secret_id" text;--> statement-breakpoint
ALTER TABLE "core_audit_streams" ADD COLUMN "secret_id" text;--> statement-breakpoint
ALTER TABLE "core_audit_streams" ADD COLUMN "auth_header_secret_id" text;--> statement-breakpoint
ALTER TABLE "core_assistant_connections" ADD COLUMN "key_secret_id" text;--> statement-breakpoint
ALTER TABLE "core_email_settings" ADD COLUMN "secret_id" text;--> statement-breakpoint
ALTER TABLE "core_integrations" ADD COLUMN "values_secret_id" text;--> statement-breakpoint
ALTER TABLE "core_secrets" ADD CONSTRAINT "core_secrets_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_secrets_org_idx" ON "core_secrets" USING btree ("org_id");--> statement-breakpoint
UPDATE "core_webhooks" SET "secret_id" = substr(md5(random()::text || "id" || 'secret_id'), 1, 17) WHERE "secret_sealed" IS NOT NULL;--> statement-breakpoint
INSERT INTO "core_secrets" ("id", "org_id", "owner", "key_id", "sealed") SELECT "secret_id", "org_id", 'core', 'legacy', "secret_sealed" FROM "core_webhooks" WHERE "secret_sealed" IS NOT NULL;--> statement-breakpoint
UPDATE "core_audit_streams" SET "secret_id" = substr(md5(random()::text || "id" || 'secret_id'), 1, 17) WHERE "secret_sealed" IS NOT NULL;--> statement-breakpoint
INSERT INTO "core_secrets" ("id", "org_id", "owner", "key_id", "sealed") SELECT "secret_id", "org_id", 'core', 'legacy', "secret_sealed" FROM "core_audit_streams" WHERE "secret_sealed" IS NOT NULL;--> statement-breakpoint
UPDATE "core_audit_streams" SET "auth_header_secret_id" = substr(md5(random()::text || "id" || 'auth_header_secret_id'), 1, 17) WHERE "auth_header_value_sealed" IS NOT NULL;--> statement-breakpoint
INSERT INTO "core_secrets" ("id", "org_id", "owner", "key_id", "sealed") SELECT "auth_header_secret_id", "org_id", 'core', 'legacy', "auth_header_value_sealed" FROM "core_audit_streams" WHERE "auth_header_value_sealed" IS NOT NULL;--> statement-breakpoint
UPDATE "core_file_buckets" SET "secret_id" = substr(md5(random()::text || "org_id" || 'secret_id'), 1, 17) WHERE "secret_sealed" IS NOT NULL;--> statement-breakpoint
INSERT INTO "core_secrets" ("id", "org_id", "owner", "key_id", "sealed") SELECT "secret_id", "org_id", 'core', 'legacy', "secret_sealed" FROM "core_file_buckets" WHERE "secret_sealed" IS NOT NULL;--> statement-breakpoint
UPDATE "core_email_settings" SET "secret_id" = substr(md5(random()::text || "org_id" || 'secret_id'), 1, 17) WHERE "secret_sealed" IS NOT NULL;--> statement-breakpoint
INSERT INTO "core_secrets" ("id", "org_id", "owner", "key_id", "sealed") SELECT "secret_id", "org_id", 'core', 'legacy', "secret_sealed" FROM "core_email_settings" WHERE "secret_sealed" IS NOT NULL;--> statement-breakpoint
UPDATE "core_payment_gateways" SET "config_secret_id" = substr(md5(random()::text || "id" || 'config_secret_id'), 1, 17) WHERE "config_sealed" IS NOT NULL;--> statement-breakpoint
INSERT INTO "core_secrets" ("id", "org_id", "owner", "key_id", "sealed") SELECT "config_secret_id", "org_id", 'core', 'legacy', "config_sealed" FROM "core_payment_gateways" WHERE "config_sealed" IS NOT NULL;--> statement-breakpoint
UPDATE "core_assistant_connections" SET "key_secret_id" = substr(md5(random()::text || "id" || 'key_secret_id'), 1, 17) WHERE "sealed_key" IS NOT NULL;--> statement-breakpoint
INSERT INTO "core_secrets" ("id", "org_id", "owner", "key_id", "sealed") SELECT "key_secret_id", "org_id", 'core', 'legacy', "sealed_key" FROM "core_assistant_connections" WHERE "sealed_key" IS NOT NULL;--> statement-breakpoint
UPDATE "core_integrations" SET "values_secret_id" = substr(md5(random()::text || "id" || 'values_secret_id'), 1, 17) WHERE "secrets_sealed" IS NOT NULL;--> statement-breakpoint
INSERT INTO "core_secrets" ("id", "org_id", "owner", "key_id", "sealed") SELECT "values_secret_id", "org_id", 'core', 'legacy', "secrets_sealed" FROM "core_integrations" WHERE "secrets_sealed" IS NOT NULL;--> statement-breakpoint
UPDATE "core_users" SET "totp_secret_id" = substr(md5(random()::text || "id" || 'totp_secret_id'), 1, 17) WHERE "totp_secret_sealed" IS NOT NULL;--> statement-breakpoint
INSERT INTO "core_secrets" ("id", "org_id", "owner", "key_id", "sealed") SELECT "totp_secret_id", "org_id", 'core', 'legacy', "totp_secret_sealed" FROM "core_users" WHERE "totp_secret_sealed" IS NOT NULL;--> statement-breakpoint
UPDATE "core_users" SET "totp_pending_secret_id" = substr(md5(random()::text || "id" || 'totp_pending_secret_id'), 1, 17) WHERE "totp_pending_sealed" IS NOT NULL;--> statement-breakpoint
INSERT INTO "core_secrets" ("id", "org_id", "owner", "key_id", "sealed") SELECT "totp_pending_secret_id", "org_id", 'core', 'legacy', "totp_pending_sealed" FROM "core_users" WHERE "totp_pending_sealed" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "core_file_buckets" ALTER COLUMN "secret_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "core_webhooks" ALTER COLUMN "secret_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "core_payment_gateways" ALTER COLUMN "config_secret_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "core_audit_streams" ALTER COLUMN "secret_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "core_assistant_connections" ALTER COLUMN "key_secret_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "core_email_settings" ALTER COLUMN "secret_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "core_users" ADD CONSTRAINT "core_users_totp_secret_id_fkey" FOREIGN KEY ("totp_secret_id") REFERENCES "public"."core_secrets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_users" ADD CONSTRAINT "core_users_totp_pending_secret_id_fkey" FOREIGN KEY ("totp_pending_secret_id") REFERENCES "public"."core_secrets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_file_buckets" ADD CONSTRAINT "core_file_buckets_secret_id_fkey" FOREIGN KEY ("secret_id") REFERENCES "public"."core_secrets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_webhooks" ADD CONSTRAINT "core_webhooks_secret_id_fkey" FOREIGN KEY ("secret_id") REFERENCES "public"."core_secrets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_payment_gateways" ADD CONSTRAINT "core_payment_gateways_config_secret_id_fkey" FOREIGN KEY ("config_secret_id") REFERENCES "public"."core_secrets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_audit_streams" ADD CONSTRAINT "core_audit_streams_secret_id_fkey" FOREIGN KEY ("secret_id") REFERENCES "public"."core_secrets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_audit_streams" ADD CONSTRAINT "core_audit_streams_auth_header_secret_id_fkey" FOREIGN KEY ("auth_header_secret_id") REFERENCES "public"."core_secrets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_assistant_connections" ADD CONSTRAINT "core_assistant_connections_key_secret_id_fkey" FOREIGN KEY ("key_secret_id") REFERENCES "public"."core_secrets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_email_settings" ADD CONSTRAINT "core_email_settings_secret_id_fkey" FOREIGN KEY ("secret_id") REFERENCES "public"."core_secrets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_integrations" ADD CONSTRAINT "core_integrations_values_secret_id_fkey" FOREIGN KEY ("values_secret_id") REFERENCES "public"."core_secrets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_users_totp_secret_idx" ON "core_users" USING btree ("totp_secret_id") WHERE "core_users"."totp_secret_id" is not null;--> statement-breakpoint
CREATE INDEX "core_users_totp_pending_secret_idx" ON "core_users" USING btree ("totp_pending_secret_id") WHERE "core_users"."totp_pending_secret_id" is not null;
--> statement-breakpoint
ALTER TABLE core_secrets ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_secrets FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_secrets USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
CREATE FUNCTION core_drop_secrets() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  v_old jsonb := to_jsonb(OLD);
  v_new jsonb := CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE '{}'::jsonb END;
  v_kept text[] := '{}';
  v_id text;
BEGIN
  FOR i IN 0 .. TG_NARGS - 1 LOOP
    v_kept := v_kept || (v_new ->> TG_ARGV[i]);
  END LOOP;
  v_kept := array_remove(v_kept, NULL);
  FOR i IN 0 .. TG_NARGS - 1 LOOP
    v_id := v_old ->> TG_ARGV[i];
    IF v_id IS NOT NULL AND v_id <> ALL (v_kept) THEN
      DELETE FROM core_secrets WHERE id = v_id;
    END IF;
  END LOOP;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE TRIGGER core_webhooks_drop_secrets AFTER DELETE OR UPDATE OF secret_id ON core_webhooks
  FOR EACH ROW EXECUTE FUNCTION core_drop_secrets('secret_id');
--> statement-breakpoint
CREATE TRIGGER core_audit_streams_drop_secrets AFTER DELETE OR UPDATE OF secret_id, auth_header_secret_id ON core_audit_streams
  FOR EACH ROW EXECUTE FUNCTION core_drop_secrets('secret_id', 'auth_header_secret_id');
--> statement-breakpoint
CREATE TRIGGER core_file_buckets_drop_secrets AFTER DELETE OR UPDATE OF secret_id ON core_file_buckets
  FOR EACH ROW EXECUTE FUNCTION core_drop_secrets('secret_id');
--> statement-breakpoint
CREATE TRIGGER core_email_settings_drop_secrets AFTER DELETE OR UPDATE OF secret_id ON core_email_settings
  FOR EACH ROW EXECUTE FUNCTION core_drop_secrets('secret_id');
--> statement-breakpoint
CREATE TRIGGER core_payment_gateways_drop_secrets AFTER DELETE OR UPDATE OF config_secret_id ON core_payment_gateways
  FOR EACH ROW EXECUTE FUNCTION core_drop_secrets('config_secret_id');
--> statement-breakpoint
CREATE TRIGGER core_assistant_connections_drop_secrets AFTER DELETE OR UPDATE OF key_secret_id ON core_assistant_connections
  FOR EACH ROW EXECUTE FUNCTION core_drop_secrets('key_secret_id');
--> statement-breakpoint
CREATE TRIGGER core_integrations_drop_secrets AFTER DELETE OR UPDATE OF values_secret_id ON core_integrations
  FOR EACH ROW EXECUTE FUNCTION core_drop_secrets('values_secret_id');
--> statement-breakpoint
CREATE TRIGGER core_users_drop_secrets AFTER DELETE OR UPDATE OF totp_secret_id, totp_pending_secret_id ON core_users
  FOR EACH ROW EXECUTE FUNCTION core_drop_secrets('totp_secret_id', 'totp_pending_secret_id');
