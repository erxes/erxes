-- Roles and permissions. Inserts below run in the migration's transaction as
-- the system (row level security is forced on organisation tables).
SELECT set_config('app.system', 'on', true);
--> statement-breakpoint
CREATE TABLE "core_roles" (
	"org_id" text NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"permissions" text[] DEFAULT '{}'::text[] NOT NULL,
	"builtin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_roles_pkey" PRIMARY KEY("org_id","key")
);
--> statement-breakpoint
-- Every organisation gets the built-in roles.
INSERT INTO core_roles (org_id, key, name, description, permissions, builtin)
SELECT o.id, r.key, r.name, r.description, r.permissions, true
FROM core_organizations o
CROSS JOIN (VALUES
  ('owner', 'Owner', 'Everything, including billing, plugins and the audit log''s retention', '{*}'::text[]),
  ('admin', 'Admin', 'Everything except owner-only actions', '{*}'::text[]),
  ('member', 'Member', 'Works with contacts and tags', '{contacts.view,contacts.create,contacts.edit,tags.manage,team.view}'::text[])
) AS r(key, name, description, permissions)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
ALTER TABLE core_roles ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_roles FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_roles USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE "core_users" DROP CONSTRAINT "core_users_role_check";--> statement-breakpoint
ALTER TABLE "core_roles" ADD CONSTRAINT "core_roles_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_users" ADD CONSTRAINT "core_users_role_fkey" FOREIGN KEY ("org_id","role") REFERENCES "public"."core_roles"("org_id","key") ON DELETE no action ON UPDATE no action;