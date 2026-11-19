CREATE TABLE "core_agent_models" (
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"agent" text NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_agent_models_pkey" PRIMARY KEY("org_id","agent"),
	CONSTRAINT "core_agent_models_provider_check" CHECK ("core_agent_models"."provider" IN ('openai', 'grok', 'kimi', 'kimi-code'))
);
--> statement-breakpoint
ALTER TABLE "core_agent_models" ADD CONSTRAINT "core_agent_models_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_agent_models" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "core_agent_models" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY core_tenant ON "core_agent_models" USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));