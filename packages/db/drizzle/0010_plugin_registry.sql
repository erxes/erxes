CREATE TABLE "core_plugin_installations" (
	"org_id" text NOT NULL,
	"plugin" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"granted_scopes" text[] DEFAULT '{}'::text[] NOT NULL,
	"installed_by" text,
	"installed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_token_at" timestamp with time zone,
	CONSTRAINT "core_plugin_installations_pkey" PRIMARY KEY("org_id","plugin")
);
--> statement-breakpoint
CREATE TABLE "core_plugins" (
	"name" text PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"manifest" jsonb,
	"secret_hash" text,
	"previous_secret_hash" text,
	"previous_secret_expires_at" timestamp with time zone,
	"secret_rotated_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core_plugin_installations" ADD CONSTRAINT "core_plugin_installations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_plugin_installations" ADD CONSTRAINT "core_plugin_installations_plugin_fkey" FOREIGN KEY ("plugin") REFERENCES "public"."core_plugins"("name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_plugin_installations_plugin_idx" ON "core_plugin_installations" USING btree ("plugin");--> statement-breakpoint
-- Plugins on core's database tell open browsers something changed, inside
-- their own transaction (sent only on commit): `SELECT core_live_signal(org,
-- 'hr', 'leave-requests')`, or only to some members with `user_ids`. Like
-- core's own signals it carries no data: the plugin UI refetches its API.
CREATE OR REPLACE FUNCTION core_live_signal(p_org_id text, p_plugin text, p_topic text, p_user_ids text[] DEFAULT NULL)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  chunk text[];
  total int := coalesce(array_length(p_user_ids, 1), 0);
  i int := 1;
BEGIN
  IF p_plugin !~ '^[a-z][a-z0-9_]{0,39}$' OR p_topic !~ '^[a-z0-9][a-z0-9._:-]{0,99}$' THEN
    RAISE EXCEPTION 'core_live_signal: invalid plugin or topic';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM core_plugin_installations
    WHERE org_id = p_org_id AND plugin = p_plugin AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'core_live_signal: % is not installed in this organisation', p_plugin;
  END IF;
  IF total = 0 THEN
    PERFORM pg_notify('core_live', json_build_object('o', p_org_id, 'k', 'plugin', 'p', p_plugin, 't', p_topic)::text);
    RETURN;
  END IF;
  -- Notifications are limited to 8000 bytes: 100 member ids at a time.
  WHILE i <= total LOOP
    chunk := p_user_ids[i:i + 99];
    PERFORM pg_notify('core_live', json_build_object('o', p_org_id, 'k', 'plugin', 'p', p_plugin, 't', p_topic, 'u', chunk)::text);
    i := i + 100;
  END LOOP;
END $$;
