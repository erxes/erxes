CREATE TABLE "core_meta_apps" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"app_id" text NOT NULL,
	"secret_sealed" text NOT NULL,
	"verify_token" text NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_meta_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"kind" text NOT NULL,
	"external_id" text NOT NULL,
	"page_id" text NOT NULL,
	"name" text NOT NULL,
	"username" text,
	"token_sealed" text NOT NULL,
	"app" text NOT NULL,
	"status" text DEFAULT 'healthy' NOT NULL,
	"status_reason" text,
	"connected_by" text,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"checked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_meta_connections_kind_check" CHECK ("core_meta_connections"."kind" IN ('facebook', 'instagram')),
	CONSTRAINT "core_meta_connections_app_check" CHECK ("core_meta_connections"."app" IN ('own', 'install')),
	CONSTRAINT "core_meta_connections_status_check" CHECK ("core_meta_connections"."status" IN ('healthy', 'broken'))
);
--> statement-breakpoint
CREATE TABLE "core_meta_people" (
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"kind" text NOT NULL,
	"external_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_meta_people_pkey" PRIMARY KEY("org_id","kind","external_id"),
	CONSTRAINT "core_meta_people_kind_check" CHECK ("core_meta_people"."kind" IN ('facebook', 'instagram'))
);
--> statement-breakpoint
CREATE TABLE "core_meta_sends" (
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"idempotency_key" text NOT NULL,
	"connection_id" text NOT NULL,
	"result" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_meta_sends_pkey" PRIMARY KEY("org_id","idempotency_key")
);
--> statement-breakpoint
ALTER TABLE "core_meta_apps" ADD CONSTRAINT "core_meta_apps_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_meta_connections" ADD CONSTRAINT "core_meta_connections_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_meta_people" ADD CONSTRAINT "core_meta_people_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."core_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_meta_people" ADD CONSTRAINT "core_meta_people_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_meta_sends" ADD CONSTRAINT "core_meta_sends_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "public"."core_meta_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_meta_sends" ADD CONSTRAINT "core_meta_sends_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_meta_apps_org_key" ON "core_meta_apps" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "core_meta_connections_org_kind_external_key" ON "core_meta_connections" USING btree ("org_id","kind","external_id");--> statement-breakpoint
CREATE INDEX "core_meta_connections_route_idx" ON "core_meta_connections" USING btree ("kind","external_id","app","connected_at");--> statement-breakpoint
CREATE INDEX "core_meta_people_org_customer_idx" ON "core_meta_people" USING btree ("org_id","customer_id");--> statement-breakpoint
CREATE INDEX "core_meta_sends_created_idx" ON "core_meta_sends" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE core_meta_apps ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_meta_apps FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_meta_apps USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_meta_connections ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_meta_connections FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_meta_connections USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_meta_people ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_meta_people FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_meta_people USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_meta_sends ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_meta_sends FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_meta_sends USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
