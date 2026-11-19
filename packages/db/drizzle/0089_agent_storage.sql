CREATE TABLE "core_agent_conversations" (
	"storage_key" text DEFAULT current_setting('pi.storage_key') NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"id" bigint NOT NULL,
	"owner_conversation_id" bigint,
	"owner_task_id" bigint,
	"record" text NOT NULL,
	CONSTRAINT "core_agent_conversations_pkey" PRIMARY KEY("storage_key","id")
);
--> statement-breakpoint
CREATE TABLE "core_agent_document_revisions" (
	"storage_key" text DEFAULT current_setting('pi.storage_key') NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"document_id" bigint NOT NULL,
	"seq" bigint NOT NULL,
	"kind" text NOT NULL,
	"version" integer NOT NULL,
	"content" text NOT NULL,
	CONSTRAINT "core_agent_document_revisions_pkey" PRIMARY KEY("storage_key","document_id","seq"),
	CONSTRAINT "core_agent_document_revisions_kind_check" CHECK ("core_agent_document_revisions"."kind" IN ('base', 'delta'))
);
--> statement-breakpoint
CREATE TABLE "core_agent_documents" (
	"storage_key" text DEFAULT current_setting('pi.storage_key') NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"id" bigint NOT NULL,
	"kind" text NOT NULL,
	"family" smallint NOT NULL,
	"key_value" text NOT NULL,
	"scope_kind" text NOT NULL,
	"owner_id" bigint NOT NULL,
	"created_at" bigint NOT NULL,
	"retired_at" bigint,
	"record" text NOT NULL,
	CONSTRAINT "core_agent_documents_pkey" PRIMARY KEY("storage_key","id"),
	CONSTRAINT "core_agent_documents_family_check" CHECK ("core_agent_documents"."family" IN (0, 1)),
	CONSTRAINT "core_agent_documents_scope_check" CHECK ("core_agent_documents"."scope_kind" IN ('session', 'conversation', 'task'))
);
--> statement-breakpoint
CREATE TABLE "core_agent_durable_metadata" (
	"storage_key" text DEFAULT current_setting('pi.storage_key') NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"singleton" integer NOT NULL,
	"next_id" bigint NOT NULL,
	"next_seq" bigint NOT NULL,
	"lease_owner" text,
	"lease_until" timestamp with time zone,
	CONSTRAINT "core_agent_durable_metadata_pkey" PRIMARY KEY("storage_key","singleton"),
	CONSTRAINT "core_agent_durable_metadata_singleton_check" CHECK ("core_agent_durable_metadata"."singleton" = 1)
);
--> statement-breakpoint
CREATE TABLE "core_agent_entries" (
	"storage_key" text DEFAULT current_setting('pi.storage_key') NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"id" bigint NOT NULL,
	"conversation_id" bigint NOT NULL,
	"head" bigint,
	"commit_seq" bigint NOT NULL,
	"record" text NOT NULL,
	CONSTRAINT "core_agent_entries_pkey" PRIMARY KEY("storage_key","id")
);
--> statement-breakpoint
CREATE TABLE "core_agent_record_ids" (
	"storage_key" text DEFAULT current_setting('pi.storage_key') NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"id" bigint NOT NULL,
	"record_type" text NOT NULL,
	CONSTRAINT "core_agent_record_ids_pkey" PRIMARY KEY("storage_key","id"),
	CONSTRAINT "core_agent_record_ids_type_check" CHECK ("core_agent_record_ids"."record_type" IN ('conversation', 'entry', 'task', 'submission', 'document'))
);
--> statement-breakpoint
CREATE TABLE "core_agent_submissions" (
	"storage_key" text DEFAULT current_setting('pi.storage_key') NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"id" bigint NOT NULL,
	"conversation_id" bigint NOT NULL,
	"request_id" text,
	"status" text NOT NULL,
	"record" text NOT NULL,
	CONSTRAINT "core_agent_submissions_pkey" PRIMARY KEY("storage_key","id"),
	CONSTRAINT "core_agent_submissions_status_check" CHECK ("core_agent_submissions"."status" IN ('queued', 'placed', 'done', 'unanswered'))
);
--> statement-breakpoint
CREATE TABLE "core_agent_tasks" (
	"storage_key" text DEFAULT current_setting('pi.storage_key') NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"id" bigint NOT NULL,
	"conversation_id" bigint NOT NULL,
	"kind" text NOT NULL,
	"status" text NOT NULL,
	"abort_requested" boolean NOT NULL,
	"background" boolean NOT NULL,
	"record" text NOT NULL,
	CONSTRAINT "core_agent_tasks_pkey" PRIMARY KEY("storage_key","id"),
	CONSTRAINT "core_agent_tasks_status_check" CHECK ("core_agent_tasks"."status" IN ('pending', 'running', 'waiting', 'sleeping', 'completing', 'terminal'))
);
--> statement-breakpoint
ALTER TABLE "core_agent_conversations" ADD CONSTRAINT "core_agent_conversations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_agent_document_revisions" ADD CONSTRAINT "core_agent_document_revisions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_agent_documents" ADD CONSTRAINT "core_agent_documents_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_agent_durable_metadata" ADD CONSTRAINT "core_agent_durable_metadata_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_agent_entries" ADD CONSTRAINT "core_agent_entries_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_agent_record_ids" ADD CONSTRAINT "core_agent_record_ids_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_agent_submissions" ADD CONSTRAINT "core_agent_submissions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_agent_tasks" ADD CONSTRAINT "core_agent_tasks_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_agent_conversations_owner_conversation_idx" ON "core_agent_conversations" USING btree ("storage_key","owner_conversation_id","id");--> statement-breakpoint
CREATE INDEX "core_agent_conversations_owner_task_idx" ON "core_agent_conversations" USING btree ("storage_key","owner_task_id","id");--> statement-breakpoint
CREATE INDEX "core_agent_document_revisions_kind_idx" ON "core_agent_document_revisions" USING btree ("storage_key","document_id","kind","seq" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_agent_documents_address_idx" ON "core_agent_documents" USING btree ("storage_key","kind","scope_kind","owner_id","family","key_value","created_at" DESC NULLS LAST,"retired_at");--> statement-breakpoint
CREATE INDEX "core_agent_documents_scope_idx" ON "core_agent_documents" USING btree ("storage_key","scope_kind","owner_id","id");--> statement-breakpoint
CREATE INDEX "core_agent_documents_scope_kind_idx" ON "core_agent_documents" USING btree ("storage_key","scope_kind","owner_id","kind","id");--> statement-breakpoint
CREATE INDEX "core_agent_entries_conversation_idx" ON "core_agent_entries" USING btree ("storage_key","conversation_id","id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_agent_entries_head_idx" ON "core_agent_entries" USING btree ("storage_key","conversation_id","id" DESC NULLS LAST) WHERE "core_agent_entries"."head" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_agent_submissions_request_idx" ON "core_agent_submissions" USING btree ("storage_key","conversation_id","request_id");--> statement-breakpoint
CREATE INDEX "core_agent_submissions_conversation_idx" ON "core_agent_submissions" USING btree ("storage_key","conversation_id","id");--> statement-breakpoint
CREATE INDEX "core_agent_submissions_status_idx" ON "core_agent_submissions" USING btree ("storage_key","status","id");--> statement-breakpoint
CREATE INDEX "core_agent_tasks_status_idx" ON "core_agent_tasks" USING btree ("storage_key","status","id");--> statement-breakpoint
CREATE INDEX "core_agent_tasks_conversation_idx" ON "core_agent_tasks" USING btree ("storage_key","conversation_id","id");--> statement-breakpoint
CREATE INDEX "core_agent_tasks_kind_idx" ON "core_agent_tasks" USING btree ("storage_key","kind","id");--> statement-breakpoint
CREATE INDEX "core_agent_tasks_abort_requested_idx" ON "core_agent_tasks" USING btree ("storage_key","abort_requested","id");--> statement-breakpoint
CREATE INDEX "core_agent_tasks_background_idx" ON "core_agent_tasks" USING btree ("storage_key","background","id");--> statement-breakpoint
-- Each table: the organisation's rows (core_tenant), and of those only the storage the transaction
-- opened (pi.storage_key). The second policy is restrictive, so it narrows, never widens.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['core_agent_durable_metadata', 'core_agent_record_ids', 'core_agent_conversations',
    'core_agent_entries', 'core_agent_tasks', 'core_agent_submissions', 'core_agent_documents',
    'core_agent_document_revisions']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY core_tenant ON %I USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id))', t);
    EXECUTE format($p$CREATE POLICY core_agent_storage ON %I AS RESTRICTIVE USING (storage_key = current_setting('pi.storage_key', true)) WITH CHECK (storage_key = current_setting('pi.storage_key', true))$p$, t);
  END LOOP;
END $$;