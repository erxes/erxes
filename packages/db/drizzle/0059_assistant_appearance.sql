CREATE TABLE "core_assistant_appearances" (
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"user_id" text NOT NULL,
	"body" text DEFAULT 'circle' NOT NULL,
	"color" text DEFAULT 'ink' NOT NULL,
	"expression" text DEFAULT 'neutral' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_assistant_appearances_pkey" PRIMARY KEY("org_id","user_id"),
	CONSTRAINT "core_assistant_appearances_body_check" CHECK ("core_assistant_appearances"."body" IN ('circle', 'pebble', 'squircle', 'capsule', 'triangle', 'hexagon', 'cloud', 'drop')),
	CONSTRAINT "core_assistant_appearances_color_check" CHECK ("core_assistant_appearances"."color" IN ('ink', 'brown', 'red', 'orange', 'amber', 'green', 'teal', 'blue', 'violet', 'pink', 'grey')),
	CONSTRAINT "core_assistant_appearances_expression_check" CHECK ("core_assistant_appearances"."expression" IN ('neutral', 'attentive', 'surprised', 'excited', 'happy', 'laughing', 'angry', 'sad', 'scared', 'wary', 'confused', 'curious', 'proud', 'shy', 'bored', 'sleepy'))
);
--> statement-breakpoint
ALTER TABLE "core_assistant_appearances" ADD CONSTRAINT "core_assistant_appearances_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE core_assistant_appearances ADD CONSTRAINT core_assistant_appearances_user_org_fkey
  FOREIGN KEY (org_id, user_id) REFERENCES core_users (org_id, id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE core_assistant_appearances ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_assistant_appearances FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_assistant_appearances USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
