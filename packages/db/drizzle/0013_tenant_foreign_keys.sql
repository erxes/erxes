-- Links can't cross organisations: composite foreign keys on (org_id, id),
-- next to the single-column ones. A customer's owner, tag or company, a
-- field's group, a notification's member and a failure's event must belong
-- to the same organisation as the row pointing at them.
CREATE UNIQUE INDEX IF NOT EXISTS core_users_org_id_id_key ON core_users (org_id, id);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS core_customers_org_id_id_key ON core_customers (org_id, id);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS core_companies_org_id_id_key ON core_companies (org_id, id);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS core_field_groups_org_id_id_key ON core_field_groups (org_id, id);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS core_tags_org_id_id_key ON core_tags (org_id, id);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS core_events_org_id_id_key ON core_events (org_id, id);
--> statement-breakpoint
ALTER TABLE core_customers ADD CONSTRAINT core_customers_owner_org_fkey
  FOREIGN KEY (org_id, owner_id) REFERENCES core_users (org_id, id) ON DELETE SET NULL (owner_id);
--> statement-breakpoint
ALTER TABLE core_companies ADD CONSTRAINT core_companies_owner_org_fkey
  FOREIGN KEY (org_id, owner_id) REFERENCES core_users (org_id, id) ON DELETE SET NULL (owner_id);
--> statement-breakpoint
ALTER TABLE core_customer_companies ADD CONSTRAINT core_customer_companies_customer_org_fkey
  FOREIGN KEY (org_id, customer_id) REFERENCES core_customers (org_id, id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE core_customer_companies ADD CONSTRAINT core_customer_companies_company_org_fkey
  FOREIGN KEY (org_id, company_id) REFERENCES core_companies (org_id, id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE core_customer_tags ADD CONSTRAINT core_customer_tags_customer_org_fkey
  FOREIGN KEY (org_id, customer_id) REFERENCES core_customers (org_id, id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE core_customer_tags ADD CONSTRAINT core_customer_tags_tag_org_fkey
  FOREIGN KEY (org_id, tag_id) REFERENCES core_tags (org_id, id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE core_company_tags ADD CONSTRAINT core_company_tags_company_org_fkey
  FOREIGN KEY (org_id, company_id) REFERENCES core_companies (org_id, id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE core_company_tags ADD CONSTRAINT core_company_tags_tag_org_fkey
  FOREIGN KEY (org_id, tag_id) REFERENCES core_tags (org_id, id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE core_fields ADD CONSTRAINT core_fields_group_org_fkey
  FOREIGN KEY (org_id, group_id) REFERENCES core_field_groups (org_id, id) ON DELETE SET NULL (group_id);
--> statement-breakpoint
ALTER TABLE core_notifications ADD CONSTRAINT core_notifications_user_org_fkey
  FOREIGN KEY (org_id, user_id) REFERENCES core_users (org_id, id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE core_event_failures ADD CONSTRAINT core_event_failures_event_org_fkey
  FOREIGN KEY (org_id, event_id) REFERENCES core_events (org_id, id) ON DELETE CASCADE;
