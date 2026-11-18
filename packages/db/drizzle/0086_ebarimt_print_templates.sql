CREATE TABLE "core_ebarimt_print_templates" (
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"plugin" text NOT NULL,
	"paper_size" text DEFAULT '80mm' NOT NULL,
	"blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"header_text" text DEFAULT '' NOT NULL,
	"footer_text" text DEFAULT '' NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_ebarimt_print_templates_pkey" PRIMARY KEY("org_id","plugin"),
	CONSTRAINT "core_ebarimt_print_templates_paper_size_check" CHECK ("core_ebarimt_print_templates"."paper_size" IN ('58mm', '80mm', 'a4'))
);
--> statement-breakpoint
ALTER TABLE "core_ebarimt_print_templates" ADD CONSTRAINT "core_ebarimt_print_templates_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE core_ebarimt_print_templates ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_ebarimt_print_templates FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_ebarimt_print_templates USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));