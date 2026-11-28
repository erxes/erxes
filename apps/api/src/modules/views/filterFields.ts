import { isCoreFieldType, LEAD_SOURCES, type ViewRecordType } from '@erxes/core-contract';
import { CONTENT_TYPES } from '@erxes/core-db/enums';
import {
  companies,
  customerCompanies,
  customers,
  type Db,
  fields,
  leadStages,
} from '@erxes/core-db';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { fieldShown, pluginTitle } from '~/modules/fields/fieldRows';
import { type CustomSpec, field, type FieldSpec, type FieldType } from './fieldSpec';
import { textArray } from '@erxes/plugin-sdk/filter';
import { dataFilterFields } from './dataFilterFields';
import { productFields } from './productFilterFields';
import { relationFields } from './relationFields';

const STORAGE: Record<string, CustomSpec['storage']> = {
  number: 'number',
  date: 'date',
  boolean: 'bool',
};

const FILTER_TYPE: Record<string, FieldType> = {
  number: 'number',
  date: 'date',
  boolean: 'boolean',
  select: 'select',
  radio: 'select',
  multiselect: 'select',
  check: 'select',
};

/**
 * A column that stores one of fixed lower-case values (a state, a source): "is" compares the
 * value as stored instead of lower(column), so the column's index applies.
 */
const storedValues = (names: string[]) => textArray(names.map((name) => name.toLowerCase()));

export const isCompanyList = (recordType: ViewRecordType) =>
  recordType === 'company' || recordType === 'company_lead';

const COMPANY_FIELDS: FieldSpec[] = [
  field('primaryName', 'Name', 'text', sql`${companies.primaryName}`, { trigram: true }),
  field('primaryEmail', 'Email', 'text', sql`${companies.primaryEmail}`),
  field('primaryPhone', 'Phone', 'text', sql`${companies.primaryPhone}`),
  field('website', 'Website', 'text', sql`${companies.website}`),
  field('industry', 'Industry', 'text', sql`${companies.industry}`),
  field('size', 'Employees', 'number', sql`${companies.size}`),
  field('businessType', 'Business type', 'text', sql`${companies.businessType}`),
  field('code', 'Code', 'text', sql`${companies.code}`),
  // Every name and phone, the primary one first: "is" means it has that one.
  field('names', 'Any name', 'text', sql`${companies.names}`, { array: true }),
  field('phones', 'Any phone', 'text', sql`${companies.phones}`, { array: true }),
];

const customerFields = (recordType: ViewRecordType): FieldSpec[] => [
  field('firstName', 'First name', 'text', sql`${customers.firstName}`, { trigram: true }),
  field('lastName', 'Last name', 'text', sql`${customers.lastName}`, { trigram: true }),
  field('primaryEmail', 'Email', 'text', sql`${customers.primaryEmail}`),
  field('primaryPhone', 'Phone', 'text', sql`${customers.primaryPhone}`, { trigram: true }),
  ...(recordType === 'customer'
    ? [
        field('state', 'State', 'select', sql`${customers.state}`, {
          options: ['lead', 'customer'],
          lookup: storedValues,
        }),
      ]
    : []),
  field('birthDate', 'Birthday', 'date', sql`${customers.birthDate}`, {
    dateOnly: true,
    monthDay: sql`${customers.birthMonthDay}`,
  }),
  field('position', 'Position', 'text', sql`${customers.position}`),
  field('department', 'Department', 'text', sql`${customers.department}`),
  field('code', 'Code', 'text', sql`${customers.code}`),
  // Every email and phone, the primary one first: "is" means it has that one.
  field('emails', 'Any email', 'text', sql`${customers.emails}`, { array: true }),
  field('phones', 'Any phone', 'text', sql`${customers.phones}`, { array: true }),
];

/** People and companies share the lifecycle; the leads list has its stage fields, the companies list (leads and customers) all of them. */
const lifecycleFields = (recordType: ViewRecordType, stageNames: string[]): FieldSpec[] => {
  const table = isCompanyList(recordType) ? companies : customers;

  return [
    ...(recordType === 'company'
      ? [
          field('state', 'State', 'select', sql`${companies.state}`, {
            options: ['lead', 'customer'],
            group: 'lead',
            lookup: storedValues,
          }),
        ]
      : []),
    field('source', 'Source', 'select', sql`${table.source}`, {
      options: [...LEAD_SOURCES],
      group: 'lead',
      lookup: storedValues,
    }),
    field('convertedAt', 'Became a customer', 'date', sql`${table.convertedAt}`, {
      group: 'lead',
    }),
    ...(recordType === 'customer'
      ? []
      : [
          field('leadStageId', 'Lead stage', 'select', sql`${table.leadStageId}`, {
            group: 'lead',
            options: stageNames,
            lookup: (names) =>
              sql`array(select ${leadStages.id} from ${leadStages} where lower(${leadStages.name}) = any(${textArray(names.map((name) => name.toLowerCase()))}))`,
          }),
          field(
            'leadStageChangedAt',
            'In this stage since',
            'date',
            sql`${table.leadStageChangedAt}`,
            { group: 'lead' },
          ),
          field(
            'disqualifyReason',
            'Disqualified because',
            'text',
            sql`${table.disqualifyReason}`,
            {
              group: 'lead',
            },
          ),
        ]),
  ];
};

const commonFields = (table: typeof companies | typeof customers): FieldSpec[] => [
  field('ownerId', 'Owner', 'member', sql`${table.ownerId}`),
  field('tagIds', 'Tags', 'tags', sql`null`),
  field('createdAt', 'Created', 'date', sql`${table.createdAt}`),
  field('updatedAt', 'Updated', 'date', sql`${table.updatedAt}`),
  // Kept by the timeline itself (creation counts), so indexed.
  field('lastActivityAt', 'Last activity', 'date', sql`${table.lastActivityAt}`, {
    group: 'activity',
  }),
];

const COMPANY_RELATED: FieldSpec[] = [
  field(
    'customerCount',
    'Customers',
    'number',
    sql`(select count(*) from ${customerCompanies} where ${customerCompanies.orgId} = ${companies.orgId} and ${customerCompanies.companyId} = ${companies.id})`,
    { group: 'company' },
  ),
];

const CUSTOMER_RELATED: FieldSpec[] = [
  field('company.primaryName', 'Company name', 'text', sql`${companies.primaryName}`, {
    group: 'company',
    viaCompany: true,
    trigram: true,
  }),
  field('company.industry', 'Company industry', 'text', sql`${companies.industry}`, {
    group: 'company',
    viaCompany: true,
  }),
  field('company.size', 'Company employees', 'number', sql`${companies.size}`, {
    group: 'company',
    viaCompany: true,
  }),
];

/** The list's custom fields; customers also filter by their company's properties. */
const customFields = async (client: Db, recordType: ViewRecordType) => {
  const isCompany = isCompanyList(recordType);

  const rows = await client
    .select({
      id: fields.id,
      contentType: fields.contentType,
      label: fields.label,
      type: fields.type,
      options: fields.options,
      plugin: fields.plugin,
      pluginTitle,
    })
    .from(fields)
    .where(
      and(
        recordType === 'product'
          ? eq(fields.contentType, 'product')
          : isCompany
            ? eq(fields.contentType, 'company')
            : inArray(fields.contentType, CONTENT_TYPES),
        fieldShown,
        eq(fields.filterable, true),
      ),
    )
    .orderBy(asc(fields.order));

  return rows.flatMap((row): FieldSpec[] => {
    const { contentType } = row;

    // Only core's records: plugin record types aren't among these rows (the query names the types).
    if (!isCoreFieldType(contentType)) return [];

    const ofCompany = contentType === 'company' && !isCompany;

    return [
      {
        path: ofCompany
          ? `subject.company.customFields.${row.id}`
          : `subject.customFields.${row.id}`,
        label: ofCompany ? `Company ${row.label}` : row.label,
        // A plugin's fields list under its title (`Sales`: Total spent, Last order).
        ...(ofCompany
          ? { group: 'company' as const }
          : row.plugin
            ? { group: 'plugin' as const, groupLabel: row.pluginTitle ?? row.plugin }
            : { group: 'custom' as const }),
        type: FILTER_TYPE[row.type] ?? 'text',
        options: row.options.length ? row.options : undefined,
        expr: sql`null`,
        dateOnly: row.type === 'date',
        viaCompany: ofCompany,
        custom: {
          recordType: contentType,
          fieldId: row.id,
          storage: STORAGE[row.type] ?? 'text',
        },
      },
    ];
  });
};

const stageNamesOf = async (client: Db) =>
  (
    await client.select({ name: leadStages.name }).from(leadStages).orderBy(asc(leadStages.order))
  ).map((stage) => stage.name);

/** Built-in fields, custom fields (`customFields.<id>`), the linked company's fields and activity. */
export const filterFields = async (
  client: Db,
  recordType: ViewRecordType,
): Promise<FieldSpec[]> => {
  if (recordType === 'product')
    return [
      ...(await productFields(client)),
      ...(await customFields(client, recordType)),
      ...(await dataFilterFields(client, recordType)),
    ];

  const isCompany = isCompanyList(recordType);
  const stageNames = recordType === 'customer' ? [] : await stageNamesOf(client);

  return [
    ...(isCompany ? COMPANY_FIELDS : customerFields(recordType)),
    ...lifecycleFields(recordType, stageNames),
    ...commonFields(isCompany ? companies : customers),
    ...(isCompany ? COMPANY_RELATED : CUSTOMER_RELATED),
    ...(await customFields(client, recordType)),
    ...(await dataFilterFields(client, recordType)),
    ...(await relationFields(client, isCompany ? 'company' : 'customer')),
  ];
};

/** The records automations run on. */
export type SubjectType = (typeof CONTENT_TYPES)[number];

/**
 * Every field of one customer or company, whichever list shows it: a person has the customers
 * list's fields (its state) and the leads list's (its stage), a company the companies list's.
 * Automations' conditions and placeholders read these.
 */
export const subjectFilterFields = async (
  client: Db,
  subject: SubjectType,
): Promise<FieldSpec[]> => {
  if (subject === 'company') return filterFields(client, 'company');

  return [
    ...customerFields('customer'),
    ...lifecycleFields('lead', await stageNamesOf(client)),
    ...commonFields(customers),
    ...CUSTOMER_RELATED,
    ...(await customFields(client, 'customer')),
    ...(await dataFilterFields(client, 'customer')),
    ...(await relationFields(client, 'customer')),
  ];
};
