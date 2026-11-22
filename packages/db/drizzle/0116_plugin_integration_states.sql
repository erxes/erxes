CREATE TABLE "core_plugin_integration_states" (
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"plugin" text NOT NULL,
	"key" text NOT NULL,
	"state" text NOT NULL,
	"count" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_plugin_integration_states_pkey" PRIMARY KEY("org_id","plugin","key"),
	CONSTRAINT "core_plugin_integration_states_state_check" CHECK ("core_plugin_integration_states"."state" IN ('connected', 'off', 'attention', 'not-set-up')),
	CONSTRAINT "core_plugin_integration_states_count_check" CHECK ("core_plugin_integration_states"."count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "core_plugin_integration_states" ADD CONSTRAINT "core_plugin_integration_states_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_plugin_integration_states" ADD CONSTRAINT "core_plugin_integration_states_installation_fkey" FOREIGN KEY ("org_id","plugin") REFERENCES "public"."core_plugin_installations"("org_id","plugin") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE core_plugin_integration_states ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_plugin_integration_states FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_plugin_integration_states USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
