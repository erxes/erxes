CREATE TABLE "core_customer_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"kind" text NOT NULL,
	"value" text NOT NULL,
	"purpose" text NOT NULL,
	"customer_id" text,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"ip" text,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_customer_codes_kind_check" CHECK ("core_customer_codes"."kind" IN ('email', 'phone')),
	CONSTRAINT "core_customer_codes_purpose_check" CHECK ("core_customer_codes"."purpose" IN ('sign_in', 'add_login'))
);
--> statement-breakpoint
CREATE TABLE "core_customer_logins" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"kind" text NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	CONSTRAINT "core_customer_logins_kind_check" CHECK ("core_customer_logins"."kind" IN ('email', 'phone'))
);
--> statement-breakpoint
CREATE TABLE "core_customer_oauth_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"client_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"code_hash" text NOT NULL,
	"redirect_uri" text NOT NULL,
	"code_challenge" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_customer_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"client_id" text,
	"token_hash" text NOT NULL,
	"previous_token_hash" text,
	"user_agent" text,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "core_customer_codes" ADD CONSTRAINT "core_customer_codes_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_codes" ADD CONSTRAINT "core_customer_codes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."core_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_logins" ADD CONSTRAINT "core_customer_logins_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_logins" ADD CONSTRAINT "core_customer_logins_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."core_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_oauth_codes" ADD CONSTRAINT "core_customer_oauth_codes_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_oauth_codes" ADD CONSTRAINT "core_customer_oauth_codes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."core_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_sessions" ADD CONSTRAINT "core_customer_sessions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_sessions" ADD CONSTRAINT "core_customer_sessions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."core_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_customer_codes_org_address_idx" ON "core_customer_codes" USING btree ("org_id","kind","value","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "core_customer_logins_org_kind_value_key" ON "core_customer_logins" USING btree ("org_id","kind","value");--> statement-breakpoint
CREATE INDEX "core_customer_logins_org_customer_idx" ON "core_customer_logins" USING btree ("org_id","customer_id");--> statement-breakpoint
CREATE INDEX "core_customer_sessions_org_customer_idx" ON "core_customer_sessions" USING btree ("org_id","customer_id");--> statement-breakpoint
ALTER TABLE core_customer_logins ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_customer_logins FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_customer_logins USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_customer_codes ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_customer_codes FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_customer_codes USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_customer_sessions ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_customer_sessions FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_customer_sessions USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_customer_oauth_codes ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_customer_oauth_codes FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_customer_oauth_codes USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));