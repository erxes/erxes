DROP INDEX "core_products_org_created_idx";--> statement-breakpoint
CREATE INDEX "core_activities_org_actor_occurred_idx" ON "core_activities" USING btree ("org_id","actor_id","occurred_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_audit_logs_action_trgm_idx" ON "core_audit_logs" USING gin ("action" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "core_audit_logs_target_label_trgm_idx" ON "core_audit_logs" USING gin ("target_label" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "core_products_name_trgm_idx" ON "core_products" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "core_products_code_trgm_idx" ON "core_products" USING gin ("code" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "core_products_org_created_idx" ON "core_products" USING btree ("org_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);