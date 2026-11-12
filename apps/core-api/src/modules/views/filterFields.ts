import { type FilterField, LEAD_SOURCES, type ViewRecordType } from '@erxes/core-contract';
import {
  companies,
  customerCompanies,
  customers,
  type ContentType,
  type Db,
  fields,
  leadStages,
} from '@erxes/core-db';
import { and, asc, eq, type SQL, sql } from 'drizzle-orm';

type FieldType = FilterField['type'];

/** A custom field, filtered through its typed value rows. */
export interface CustomSpec {
  /** Whose values: the record's own, or (customers) the linked company's. */
  recordType: ContentType;
  fieldId: string;
  /** The value column. */
  storage: 'text' | 'number' | 'date' | 'bool';
}

/** One filterable thing: how it reads in SQL for the list's table. */
export interface FieldSpec extends FilterField {
  /** The value as SQL (for `tags` and custom fields: unused; for `company.*`: a column of `core_companies`). */
  expr: SQL;
  custom?: CustomSpec;
  /** Only a day, no time (dates compare as dates so their indexes apply). */
  dateOnly?: boolean;
  /** Text with a trigram index: "is" is an ILIKE without wildcards so the index serves it. */
  trigram?: boolean;
  /** Birthday: "anniversary within" reads this stored month * 100 + day column. */
  monthDay?: SQL;
  /** Fields of the linked company: checked inside "has a company where …". */
  viaCompany?: boolean;
  /** The lead stage: rules name stages, the column holds their ids. */
  stageLookup?: boolean;
}

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

export const isCompanyList = (recordType: ViewRecordType) =>
  recordType === 'company' || recordType === 'company_lead';

const field = (
  path: string,
  label: string,
  type: FieldType,
  expr: SQL,
  extra: Partial<FieldSpec> = {},
): FieldSpec => ({
  path: `subject.${path}`,
  label,
  type,
  expr,
  group: 'fields',
  ...extra,
});

const COMPANY_FIELDS: FieldSpec[] = [
  field('primaryName', 'Name', 'text', sql`${companies.primaryName}`, { trigram: true }),
  field('primaryEmail', 'Email', 'text', sql`${companies.primaryEmail}`),
  field('primaryPhone', 'Phone', 'text', sql`${companies.primaryPhone}`),
  field('website', 'Website', 'text', sql`${companies.website}`),
  field('industry', 'Industry', 'text', sql`${companies.industry}`),
  field('size', 'Employees', 'number', sql`${companies.size}`),
  field('businessType', 'Business type', 'text', sql`${companies.businessType}`),
  field('code', 'Code', 'text', sql`${companies.code}`),
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
          }),
        ]
      : []),
    field('source', 'Source', 'select', sql`${table.source}`, {
      options: [...LEAD_SOURCES],
      group: 'lead',
    }),
    field('convertedAt', 'Became a customer', 'date', sql`${table.convertedAt}`, {
      group: 'lead',
    }),
    ...(recordType === 'customer'
      ? []
      : [
          field('leadStageId', 'Lead stage', 'select', sql`${table.leadStageId}`, {
            group: 'lead',
            stageLookup: true,
            options: stageNames,
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

/** Custom fields; customers also filter by their company's properties. */
const customFields = async (client: Db, orgId: string, isCompany: boolean) => {
  const rows = await client
    .select({
      id: fields.id,
      contentType: fields.contentType,
      label: fields.label,
      type: fields.type,
      options: fields.options,
    })
    .from(fields)
    .where(and(eq(fields.orgId, orgId), isCompany ? eq(fields.contentType, 'company') : undefined))
    .orderBy(asc(fields.order));

  return rows.map((row): FieldSpec => {
    const ofCompany = row.contentType === 'company' && !isCompany;

    return {
      path: ofCompany ? `subject.company.customFields.${row.id}` : `subject.customFields.${row.id}`,
      label: ofCompany ? `Company ${row.label}` : row.label,
      group: ofCompany ? 'company' : 'custom',
      type: FILTER_TYPE[row.type] ?? 'text',
      options: row.options.length ? row.options : undefined,
      expr: sql`null`,
      dateOnly: row.type === 'date',
      viaCompany: ofCompany,
      custom: {
        recordType: row.contentType,
        fieldId: row.id,
        storage: STORAGE[row.type] ?? 'text',
      },
    };
  });
};

const stageNamesOf = async (client: Db, orgId: string) =>
  (
    await client
      .select({ name: leadStages.name })
      .from(leadStages)
      .where(eq(leadStages.orgId, orgId))
      .orderBy(asc(leadStages.order))
  ).map((stage) => stage.name);

/** Built-in fields, custom fields (`customFields.<id>`), the linked company's fields and activity. */
export const filterFields = async (
  client: Db,
  orgId: string,
  recordType: ViewRecordType,
): Promise<FieldSpec[]> => {
  const isCompany = isCompanyList(recordType);
  const stageNames = recordType === 'customer' ? [] : await stageNamesOf(client, orgId);

  return [
    ...(isCompany ? COMPANY_FIELDS : customerFields(recordType)),
    ...lifecycleFields(recordType, stageNames),
    ...commonFields(isCompany ? companies : customers),
    ...(isCompany ? COMPANY_RELATED : CUSTOMER_RELATED),
    ...(await customFields(client, orgId, isCompany)),
  ];
};
