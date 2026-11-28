CREATE TABLE "core_agent_chats" (
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"agent_id" text NOT NULL,
	"key" text NOT NULL,
	"plugin" text NOT NULL,
	"customer_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_agent_chats_pkey" PRIMARY KEY("org_id","agent_id","key")
);
--> statement-breakpoint
CREATE TABLE "core_agents" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"name" text NOT NULL,
	"template" text,
	"instructions" text NOT NULL,
	"provider" text,
	"model" text,
	"key_id" text NOT NULL,
	"website_id" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_agents_template_check" CHECK ("core_agents"."template" IS NULL OR "core_agents"."template" IN ('shop', 'hotel', 'tours', 'support')),
	CONSTRAINT "core_agents_provider_check" CHECK ("core_agents"."provider" IS NULL OR "core_agents"."provider" IN ('openai', 'anthropic', 'openrouter', 'kimi', 'kimi-code', 'grok'))
);
--> statement-breakpoint
DROP TABLE "core_agent_models" CASCADE;--> statement-breakpoint
ALTER TABLE "core_agent_chats" ADD CONSTRAINT "core_agent_chats_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."core_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_agent_chats" ADD CONSTRAINT "core_agent_chats_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_agents" ADD CONSTRAINT "core_agents_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_agents" ADD CONSTRAINT "core_agents_key_id_fkey" FOREIGN KEY ("key_id") REFERENCES "public"."core_api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_agents" ADD CONSTRAINT "core_agents_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "public"."core_websites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_agents_org_idx" ON "core_agents" USING btree ("org_id","created_at" DESC NULLS LAST);
--> statement-breakpoint
ALTER TABLE core_agents ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_agents FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_agents USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_agent_chats ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_agent_chats FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_agent_chats USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));