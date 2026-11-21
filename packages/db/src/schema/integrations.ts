import type { AUTOMATION_FIELD_TYPES } from '../enums';
import { type INTEGRATION_FIELD_TYPES, INTEGRATION_PROGRAM_KINDS } from '../integrationEnums';
import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  integer,
  jsonb,
  primaryKey,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';
import { secrets } from './secrets';

export interface IntegrationField {
  key: string;
  label: string;
  type: (typeof INTEGRATION_FIELD_TYPES)[number];
  required: boolean;
  options?: { value: string; label: string }[];
  description?: string;
}

export interface IntegrationDataField {
  key: string;
  label: string;
  type: (typeof AUTOMATION_FIELD_TYPES)[number];
}

export interface IntegrationEvent {
  key: string;
  label: string;
  fields: IntegrationDataField[];
}

export interface IntegrationProgramDefinition {
  label: string;
  description: string | null;
  fields: IntegrationField[];
  outputs: IntegrationDataField[];
  events: IntegrationEvent[];
  code: string;
}

export const integrations = pgTable(
  'integrations',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    key: text().notNull(),
    name: text().notNull(),
    hosts: text().array().notNull(),
    valuesSecretId: text(),
    sealedNames: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_integrations_org_key_key').on(table.orgId, table.key),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_integrations_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.valuesSecretId],
      foreignColumns: [secrets.id],
      name: 'core_integrations_values_secret_id_fkey',
    }),
  ],
);

export const integrationPrograms = pgTable(
  'integration_programs',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    integrationId: text().notNull(),
    kind: text({ enum: INTEGRATION_PROGRAM_KINDS }).notNull(),
    key: text().notNull(),
    label: text().notNull(),
    description: text(),
    fields: jsonb().$type<IntegrationField[]>().default([]).notNull(),
    outputs: jsonb().$type<IntegrationDataField[]>().default([]).notNull(),
    events: jsonb().$type<IntegrationEvent[]>().default([]).notNull(),
    code: text().notNull(),
    version: integer().default(1).notNull(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_integration_programs_org_integration_kind_key_key').on(
      table.orgId,
      table.integrationId,
      table.kind,
      table.key,
    ),
    check('core_integration_programs_kind_check', inList(table.kind, INTEGRATION_PROGRAM_KINDS)),
    foreignKey({
      columns: [table.integrationId],
      foreignColumns: [integrations.id],
      name: 'core_integration_programs_integration_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_integration_programs_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const integrationProgramVersions = pgTable(
  'integration_program_versions',
  {
    orgId: orgIdColumn(),
    programId: text().notNull(),
    version: integer().notNull(),
    definition: jsonb().$type<IntegrationProgramDefinition>().notNull(),
    createdBy: text(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({
      columns: [table.programId, table.version],
      name: 'core_integration_program_versions_pkey',
    }),
    foreignKey({
      columns: [table.programId],
      foreignColumns: [integrationPrograms.id],
      name: 'core_integration_program_versions_program_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_integration_program_versions_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
