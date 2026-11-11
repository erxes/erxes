CREATE TABLE "core_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"source" text NOT NULL,
	"type" text NOT NULL,
	"summary" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"link" text,
	"actor_type" text NOT NULL,
	"actor_id" text,
	"dedupe_key" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_activities_target_type_check" CHECK ("core_activities"."target_type" IN ('customer', 'company'))
);
--> statement-breakpoint
CREATE TABLE "core_audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"actor_type" text NOT NULL,
	"actor_id" text,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"target_label" text,
	"changes" jsonb,
	"metadata" jsonb,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_files" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"content_type" text NOT NULL,
	"size" bigint NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"source" text DEFAULT 'core' NOT NULL,
	"actor_type" text NOT NULL,
	"actor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_files_status_check" CHECK ("core_files"."status" IN ('pending', 'ready')),
	CONSTRAINT "core_files_size_check" CHECK ("core_files"."size" >= 0)
);
--> statement-breakpoint
CREATE TABLE "core_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"source" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"link" text,
	"entity_type" text,
	"entity_id" text,
	"priority" text DEFAULT 'normal' NOT NULL,
	"actor_type" text NOT NULL,
	"actor_id" text,
	"dedupe_key" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_notifications_priority_check" CHECK ("core_notifications"."priority" IN ('normal', 'high'))
);
--> statement-breakpoint
ALTER TABLE "core_organizations" ADD COLUMN "settings" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "core_activities" ADD CONSTRAINT "core_activities_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_audit_logs" ADD CONSTRAINT "core_audit_logs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_files" ADD CONSTRAINT "core_files_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_notifications" ADD CONSTRAINT "core_notifications_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_notifications" ADD CONSTRAINT "core_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."core_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_activities_target_idx" ON "core_activities" USING btree ("org_id","target_type","target_id","occurred_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "core_activities_dedupe_key" ON "core_activities" USING btree ("org_id","source","dedupe_key") WHERE "core_activities"."dedupe_key" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_audit_logs_org_created_idx" ON "core_audit_logs" USING btree ("org_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_audit_logs_target_idx" ON "core_audit_logs" USING btree ("org_id","target_type","target_id");--> statement-breakpoint
CREATE INDEX "core_audit_logs_actor_idx" ON "core_audit_logs" USING btree ("org_id","actor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "core_files_key_key" ON "core_files" USING btree ("key");--> statement-breakpoint
CREATE INDEX "core_files_org_created_idx" ON "core_files" USING btree ("org_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_files_pending_idx" ON "core_files" USING btree ("created_at") WHERE "core_files"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "core_notifications_user_created_idx" ON "core_notifications" USING btree ("user_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_notifications_unread_idx" ON "core_notifications" USING btree ("user_id") WHERE "core_notifications"."read_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "core_notifications_dedupe_key" ON "core_notifications" USING btree ("org_id","user_id","dedupe_key") WHERE "core_notifications"."dedupe_key" IS NOT NULL;