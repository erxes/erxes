import { LEAD_SOURCES, type ViewRecordType } from '@erxes/core-contract';
import { companies, customerCompanies, customers, type Db, leadStages } from '@erxes/core-db';
import { asc, sql } from 'drizzle-orm';
import { field, type FieldSpec } from './fieldSpec';
import { textArray } from '@erxes/plugin-sdk/filter';
import { companyDataFilterFields, dataFilterFields } from './dataFilterFields';
import { productFields } from './productFilterFields';
import { relationFields } from './relationFields';

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

const stageNamesOf = async (client: Db) =>
  (
    await client.select({ name: leadStages.name }).from(leadStages).orderBy(asc(leadStages.order))
  ).map((stage) => stage.name);

/**
 * Built-in fields, Data Extensions fields (`subject.data.<key>`), the linked company's fields
 * (its Data Extensions ones too, `subject.company.data.<key>`) and activity.
 */
export const filterFields = async (
  client: Db,
  recordType: ViewRecordType,
): Promise<FieldSpec[]> => {
  if (recordType === 'product')
    return [...(await productFields(client)), ...(await dataFilterFields(client, recordType))];

  const isCompany = isCompanyList(recordType);
  const stageNames = recordType === 'customer' ? [] : await stageNamesOf(client);

  return [
    ...(isCompany ? COMPANY_FIELDS : customerFields(recordType)),
    ...lifecycleFields(recordType, stageNames),
    ...commonFields(isCompany ? companies : customers),
    ...(isCompany ? COMPANY_RELATED : CUSTOMER_RELATED),
    ...(await dataFilterFields(client, recordType)),
    ...(isCompany ? [] : await companyDataFilterFields(client)),
    ...(await relationFields(client, isCompany ? 'company' : 'customer')),
  ];
};

/** The records automations run on. */
export type SubjectType = 'customer' | 'company';

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
    ...(await dataFilterFields(client, 'customer')),
    ...(await companyDataFilterFields(client)),
    ...(await relationFields(client, 'customer')),
  ];
};
