import { sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  boolean,
  check,
  foreignKey,
  index,
  integer,
  primaryKey,
  smallint,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { organizations } from './organizations';

/**
 * pi-durable's storage, as `@gscode1/pi-durable-postgres` (patched in `patches/`) reads and writes
 * it. One storage per agent conversation, keyed `<agent>:<conversation>` such as
 * `assistant:<threadId>`. Every transaction sets `pi.storage_key` and `app.org_id` locally
 * (apps/api/src/modules/agents/storage.ts), so the key and the organisation fill themselves in and
 * row level security shows a storage only its own rows. Ids are pi's, counted per storage, so every
 * key leads with `storage_key`. Records are JSON text, parsed by the adapter.
 */

/** The records a storage keeps, as the Postgres adapter names them. */
const AGENT_RECORD_TYPES = ['conversation', 'entry', 'task', 'submission', 'document'] as const;

const AGENT_TASK_STATUSES = [
  'pending',
  'running',
  'waiting',
  'sleeping',
  'completing',
  'terminal',
] as const;

const AGENT_SUBMISSION_STATUSES = ['queued', 'placed', 'done', 'unanswered'] as const;
const AGENT_DOCUMENT_SCOPES = ['session', 'conversation', 'task'] as const;

/** A document address's family: 0 a singleton, 1 a keyed document. */
const AGENT_DOCUMENT_FAMILIES = [0, 1] as const;
const AGENT_REVISION_KINDS = ['base', 'delta'] as const;

const id = () => bigint({ mode: 'number' }).notNull();

const storageKey = () =>
  text()
    .notNull()
    .default(sql`current_setting('pi.storage_key')`);

const owned = (name: string, table: { orgId: AnyPgColumn }) => [
  foreignKey({
    columns: [table.orgId],
    foreignColumns: [organizations.id],
    name: `core_agent_${name}_org_id_fkey`,
  }).onDelete('cascade'),
];

export const agentDurableMetadata = pgTable(
  'agent_durable_metadata',
  {
    storageKey: storageKey(),
    orgId: orgIdColumn(),
    singleton: integer().notNull(),
    nextId: id(),
    nextSeq: id(),
    /** The API server running the storage, until `leaseUntil`; every commit checks it is still this one. */
    leaseOwner: text(),
    leaseUntil: timestamp({ withTimezone: true, mode: 'date' }),
  },
  (table) => [
    primaryKey({
      columns: [table.storageKey, table.singleton],
      name: 'core_agent_durable_metadata_pkey',
    }),
    check('core_agent_durable_metadata_singleton_check', sql`${table.singleton} = 1`),
    ...owned('durable_metadata', table),
  ],
);

export const agentRecordIds = pgTable(
  'agent_record_ids',
  {
    storageKey: storageKey(),
    orgId: orgIdColumn(),
    id: id(),
    recordType: text({ enum: AGENT_RECORD_TYPES }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.storageKey, table.id], name: 'core_agent_record_ids_pkey' }),
    check('core_agent_record_ids_type_check', inList(table.recordType, AGENT_RECORD_TYPES)),
    ...owned('record_ids', table),
  ],
);

export const agentConversations = pgTable(
  'agent_conversations',
  {
    storageKey: storageKey(),
    orgId: orgIdColumn(),
    id: id(),
    ownerConversationId: bigint({ mode: 'number' }),
    ownerTaskId: bigint({ mode: 'number' }),
    record: text().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.storageKey, table.id], name: 'core_agent_conversations_pkey' }),
    index('core_agent_conversations_owner_conversation_idx').on(
      table.storageKey,
      table.ownerConversationId,
      table.id,
    ),
    index('core_agent_conversations_owner_task_idx').on(
      table.storageKey,
      table.ownerTaskId,
      table.id,
    ),
    ...owned('conversations', table),
  ],
);

export const agentEntries = pgTable(
  'agent_entries',
  {
    storageKey: storageKey(),
    orgId: orgIdColumn(),
    id: id(),
    conversationId: id(),
    head: bigint({ mode: 'number' }),
    commitSeq: id(),
    record: text().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.storageKey, table.id], name: 'core_agent_entries_pkey' }),
    index('core_agent_entries_conversation_idx').on(
      table.storageKey,
      table.conversationId,
      table.id.desc(),
    ),
    index('core_agent_entries_head_idx')
      .on(table.storageKey, table.conversationId, table.id.desc())
      .where(sql`${table.head} IS NOT NULL`),
    ...owned('entries', table),
  ],
);

export const agentTasks = pgTable(
  'agent_tasks',
  {
    storageKey: storageKey(),
    orgId: orgIdColumn(),
    id: id(),
    conversationId: id(),
    kind: text().notNull(),
    status: text({ enum: AGENT_TASK_STATUSES }).notNull(),
    abortRequested: boolean().notNull(),
    background: boolean().notNull(),
    record: text().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.storageKey, table.id], name: 'core_agent_tasks_pkey' }),
    index('core_agent_tasks_status_idx').on(table.storageKey, table.status, table.id),
    index('core_agent_tasks_conversation_idx').on(table.storageKey, table.conversationId, table.id),
    index('core_agent_tasks_kind_idx').on(table.storageKey, table.kind, table.id),
    index('core_agent_tasks_abort_requested_idx').on(
      table.storageKey,
      table.abortRequested,
      table.id,
    ),
    index('core_agent_tasks_background_idx').on(table.storageKey, table.background, table.id),
    check('core_agent_tasks_status_check', inList(table.status, AGENT_TASK_STATUSES)),
    ...owned('tasks', table),
  ],
);

export const agentSubmissions = pgTable(
  'agent_submissions',
  {
    storageKey: storageKey(),
    orgId: orgIdColumn(),
    id: id(),
    conversationId: id(),
    requestId: text(),
    status: text({ enum: AGENT_SUBMISSION_STATUSES }).notNull(),
    record: text().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.storageKey, table.id], name: 'core_agent_submissions_pkey' }),
    index('core_agent_submissions_request_idx').on(
      table.storageKey,
      table.conversationId,
      table.requestId,
    ),
    index('core_agent_submissions_conversation_idx').on(
      table.storageKey,
      table.conversationId,
      table.id,
    ),
    index('core_agent_submissions_status_idx').on(table.storageKey, table.status, table.id),
    check('core_agent_submissions_status_check', inList(table.status, AGENT_SUBMISSION_STATUSES)),
    ...owned('submissions', table),
  ],
);

export const agentDocuments = pgTable(
  'agent_documents',
  {
    storageKey: storageKey(),
    orgId: orgIdColumn(),
    id: id(),
    kind: text().notNull(),
    family: smallint().$type<(typeof AGENT_DOCUMENT_FAMILIES)[number]>().notNull(),
    keyValue: text().notNull(),
    scopeKind: text({ enum: AGENT_DOCUMENT_SCOPES }).notNull(),
    ownerId: id(),
    createdAt: id(),
    retiredAt: bigint({ mode: 'number' }),
    record: text().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.storageKey, table.id], name: 'core_agent_documents_pkey' }),
    index('core_agent_documents_address_idx').on(
      table.storageKey,
      table.kind,
      table.scopeKind,
      table.ownerId,
      table.family,
      table.keyValue,
      table.createdAt.desc(),
      table.retiredAt,
    ),
    index('core_agent_documents_scope_idx').on(
      table.storageKey,
      table.scopeKind,
      table.ownerId,
      table.id,
    ),
    index('core_agent_documents_scope_kind_idx').on(
      table.storageKey,
      table.scopeKind,
      table.ownerId,
      table.kind,
      table.id,
    ),
    check('core_agent_documents_family_check', inList(table.family, AGENT_DOCUMENT_FAMILIES)),
    check('core_agent_documents_scope_check', inList(table.scopeKind, AGENT_DOCUMENT_SCOPES)),
    ...owned('documents', table),
  ],
);

export const agentDocumentRevisions = pgTable(
  'agent_document_revisions',
  {
    storageKey: storageKey(),
    orgId: orgIdColumn(),
    documentId: id(),
    seq: id(),
    kind: text({ enum: AGENT_REVISION_KINDS }).notNull(),
    version: integer().notNull(),
    content: text().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.storageKey, table.documentId, table.seq],
      name: 'core_agent_document_revisions_pkey',
    }),
    index('core_agent_document_revisions_kind_idx').on(
      table.storageKey,
      table.documentId,
      table.kind,
      table.seq.desc(),
    ),
    check('core_agent_document_revisions_kind_check', inList(table.kind, AGENT_REVISION_KINDS)),
    ...owned('document_revisions', table),
  ],
);
