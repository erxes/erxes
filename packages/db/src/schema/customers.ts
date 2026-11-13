import { CUSTOMER_SEXES, CUSTOMER_STATES } from '../enums';
import { sql } from 'drizzle-orm';
import {
  check,
  date,
  foreignKey,
  index,
  smallint,
  text,
  jsonb,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { leadStages } from './leadStages';
import { organizations } from './organizations';
import { users } from './users';

/** ISO/IEC 5218: 0 not known, 1 male, 2 female, 9 not applicable. */
export type CustomerSex = 0 | 1 | 2 | 9;

/** People the organisation works with, shared by every plugin. */
export const customers = pgTable(
  'customers',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    state: text({ enum: CUSTOMER_STATES }).default('customer').notNull(),
    firstName: text(),
    middleName: text(),
    lastName: text(),
    avatarUrl: text(),
    /** Lower-cased; also the first entry of `emails`. */
    primaryEmail: text(),
    emails: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    /** Without spaces, brackets and dashes; also the first entry of `phones`. */
    primaryPhone: text(),
    phones: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    /** ISO/IEC 5218: 0 not known, 1 male, 2 female, 9 not applicable. */
    sex: smallint().$type<CustomerSex>(),
    birthDate: date({ mode: 'string' }),
    position: text(),
    department: text(),
    code: text(),
    description: text(),
    ownerId: text(),
    /** Where a lead stands (its organisation's lead stages); kept after conversion for reports. */
    leadStageId: text(),
    leadStageChangedAt: timestamp({ withTimezone: true, mode: 'date' }),
    /** Why a lead was disqualified. */
    disqualifyReason: text(),
    /** Where the person came from (`manual`, `import`, `form`, `website`, `plugin`, …). */
    source: text(),
    /** More about the source: campaign, medium, referrer, page, the plugin or form. */
    sourceDetails: jsonb().$type<Record<string, string>>().default({}).notNull(),
    /** When the lead became a customer, and who converted it. */
    convertedAt: timestamp({ withTimezone: true, mode: 'date' }),
    convertedBy: text(),
    /**
     * When the newest timeline entry was made (creation counts); kept by a
     * trigger on core_activities, so "no activity for 60 days" is indexed.
     */
    lastActivityAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    /** Birthday as month * 100 + day (1231), for "birthday in the next 7 days". */
    birthMonthDay: smallint().generatedAlwaysAs(
      sql`((extract(month from birth_date) * 100 + extract(day from birth_date))::smallint)`,
    ),
    /** Names, emails, phones and code in lower case: what the search box searches (trigram indexed). */
    searchText: text().generatedAlwaysAs(
      sql`lower(coalesce(first_name, '') || ' ' || coalesce(middle_name, '') || ' ' || coalesce(last_name, '') || ' ' || core_join_text(emails) || ' ' || core_join_text(phones) || ' ' || coalesce(code, ''))`,
    ),
    /** Customers merged into this one (their ids keep resolving here). */
    mergedIds: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    createdBy: text(),
    createdAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    // One customer per primary email / phone in an organisation.
    uniqueIndex('core_customers_org_primary_email_key')
      .on(table.orgId, sql`lower(${table.primaryEmail})`)
      .where(sql`${table.primaryEmail} IS NOT NULL`),
    uniqueIndex('core_customers_org_primary_phone_key')
      .on(table.orgId, table.primaryPhone)
      .where(sql`${table.primaryPhone} IS NOT NULL`),
    // Keyset paging, newest first.
    index('core_customers_org_created_idx').on(
      table.orgId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    index('core_customers_org_state_idx').on(table.orgId, table.state),
    index('core_customers_org_last_activity_idx').on(table.orgId, table.lastActivityAt),
    index('core_customers_org_birth_month_day_idx')
      .on(table.orgId, table.birthMonthDay)
      .where(sql`${table.birthMonthDay} IS NOT NULL`),
    index('core_customers_org_owner_idx').on(table.orgId, table.ownerId),
    index('core_customers_org_lead_stage_idx').on(
      table.orgId,
      table.leadStageId,
      table.createdAt.desc(),
    ),
    index('core_customers_org_source_idx').on(table.orgId, table.source),
    index('core_customers_org_converted_idx')
      .on(table.orgId, table.convertedAt)
      .where(sql`${table.convertedAt} IS NOT NULL`),
    foreignKey({
      columns: [table.leadStageId],
      foreignColumns: [leadStages.id],
      name: 'core_customers_lead_stage_id_fkey',
    }).onDelete('set null'),
    // "Contains" anywhere: search box, and filters on names, email and phone.
    index('core_customers_search_trgm_idx').using('gin', table.searchText.op('gin_trgm_ops')),
    index('core_customers_first_name_trgm_idx').using('gin', table.firstName.op('gin_trgm_ops')),
    index('core_customers_last_name_trgm_idx').using('gin', table.lastName.op('gin_trgm_ops')),
    index('core_customers_primary_email_trgm_idx').using(
      'gin',
      table.primaryEmail.op('gin_trgm_ops'),
    ),
    index('core_customers_primary_phone_trgm_idx').using(
      'gin',
      table.primaryPhone.op('gin_trgm_ops'),
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_customers_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ownerId],
      foreignColumns: [users.id],
      name: 'core_customers_owner_id_fkey',
    }).onDelete('set null'),
    check('core_customers_state_check', inList(table.state, CUSTOMER_STATES)),
    check('core_customers_sex_check', inList(table.sex, CUSTOMER_SEXES)),
  ],
);
