CREATE TABLE "core_assistant_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"sealed_key" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_assistant_connections_provider_check" CHECK ("core_assistant_connections"."provider" IN ('openai', 'grok', 'kimi', 'kimi-code'))
);
--> statement-breakpoint
CREATE TABLE "core_assistant_messages" (
	"thread_id" text NOT NULL,
	"id" text NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"role" text NOT NULL,
	"parts" jsonb NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_assistant_messages_pkey" PRIMARY KEY("thread_id","id"),
	CONSTRAINT "core_assistant_messages_role_check" CHECK ("core_assistant_messages"."role" IN ('user', 'assistant'))
);
--> statement-breakpoint
CREATE TABLE "core_assistant_settings" (
	"org_id" text PRIMARY KEY DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"approval_mode" text DEFAULT 'writes' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_assistant_settings_approval_mode_check" CHECK ("core_assistant_settings"."approval_mode" IN ('writes', 'destructive'))
);
--> statement-breakpoint
CREATE TABLE "core_assistant_threads" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"user_id" text NOT NULL,
	"title" text,
	"pinned" boolean DEFAULT false NOT NULL,
	"running_since" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core_assistant_connections" ADD CONSTRAINT "core_assistant_connections_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_assistant_messages" ADD CONSTRAINT "core_assistant_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."core_assistant_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_assistant_messages" ADD CONSTRAINT "core_assistant_messages_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_assistant_settings" ADD CONSTRAINT "core_assistant_settings_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_assistant_threads" ADD CONSTRAINT "core_assistant_threads_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_assistant_connections_user_provider_key" ON "core_assistant_connections" USING btree ("org_id","user_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX "core_assistant_connections_user_default_key" ON "core_assistant_connections" USING btree ("org_id","user_id") WHERE "core_assistant_connections"."is_default";--> statement-breakpoint
CREATE UNIQUE INDEX "core_assistant_messages_thread_position_key" ON "core_assistant_messages" USING btree ("thread_id","position");--> statement-breakpoint
CREATE INDEX "core_assistant_messages_org_thread_idx" ON "core_assistant_messages" USING btree ("org_id","thread_id");--> statement-breakpoint
CREATE INDEX "core_assistant_threads_user_updated_idx" ON "core_assistant_threads" USING btree ("org_id","user_id","updated_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE core_assistant_connections ADD CONSTRAINT core_assistant_connections_user_org_fkey
  FOREIGN KEY (org_id, user_id) REFERENCES core_users (org_id, id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE core_assistant_threads ADD CONSTRAINT core_assistant_threads_user_org_fkey
  FOREIGN KEY (org_id, user_id) REFERENCES core_users (org_id, id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE core_assistant_connections ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_assistant_connections FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_assistant_connections USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_assistant_threads ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_assistant_threads FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_assistant_threads USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_assistant_messages ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_assistant_messages FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_assistant_messages USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_assistant_settings ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_assistant_settings FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_assistant_settings USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_assistant_threads_live() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  r core_assistant_threads%ROWTYPE := coalesce(NEW, OLD);
BEGIN
  PERFORM pg_notify('core_live', json_build_object('o', r.org_id, 'k', 'assistant', 'u', r.user_id)::text);
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE TRIGGER core_assistant_threads_live AFTER INSERT OR UPDATE OR DELETE ON core_assistant_threads
  FOR EACH ROW EXECUTE FUNCTION core_assistant_threads_live();
--> statement-breakpoint
SELECT set_config('app.system', 'on', true);
--> statement-breakpoint
UPDATE core_roles SET permissions = array_append(permissions, 'assistant.chat')
WHERE key = 'member' AND builtin AND NOT ('assistant.chat' = ANY (permissions));
