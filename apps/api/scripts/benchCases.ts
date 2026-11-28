/**
 * What the bench times on the seeded organisation (`benchSeed.ts`): each list,
 * filter, search, count and detail read a member's page asks for, through the
 * same service function the endpoint calls.
 */
import { CursorQuery } from '@erxes/core-contract';
import { type Caller, type Db, runAs, withOrg } from '@erxes/core-db';
import { listActivities, listMemberActivities } from '~/modules/activities/timeline.service';
import { listAudit } from '~/modules/audit/audit.service';
import { getCompany } from '~/modules/companies/companies.service';
import { companyPeople, listCompanies } from '~/modules/companies/companyList';
import { customerCompaniesOf } from '~/modules/customers/customerLinks';
import { listCustomers } from '~/modules/customers/customerList';
import { getCustomer } from '~/modules/customers/customers.service';
import { listNotifications, unreadCount } from '~/modules/notifications/inbox.service';
import { listProducts } from '~/modules/products/productList';
import { searchRecords } from '~/modules/search/search.service';

/** The organisation the bench reads, and its owner, who reads it. */
export interface Bench {
  orgId: string;
  owner: Caller;
}

export type BenchCase = [label: string, run: () => Promise<unknown>];

/** A list's first page, as the web asks for it. */
const FIRST_PAGE = CursorQuery.parse({ limit: 100 });

/** The page after `cursor`, as the web asks for it while scrolling. */
const nextPage = (cursor: string) =>
  CursorQuery.parse({ limit: 100, cursor, direction: 'forward', cursorMode: 'exclusive' });

interface Rule {
  path: string;
  op: string;
  value?: unknown;
}

const allOf = (...rules: Rule[]) => JSON.stringify({ match: 'all', rules });

const rule = (path: string, op: string, value?: unknown) => allOf({ path, op, value });

/** Customer list queries, by label. */
const CUSTOMER_CASES: [string, { filter?: string; search?: string }][] = [
  ['First page, no filter', {}],
  ['State is lead', { filter: rule('subject.state', 'eq', 'lead') }],
  ['Owner is a member', { filter: rule('subject.ownerId', 'eq', 'user7') }],
  [
    'Created in the last 30 days',
    { filter: rule('subject.createdAt', 'within_last', { amount: 30, unit: 'days' }) },
  ],
  ['Email contains', { filter: rule('subject.primaryEmail', 'contains', 'p12345@') }],
  ['Search box', { search: 'p12345@' }],
  ['Has a tag', { filter: rule('subject.tagIds', 'contains', 'tag5') }],
  ['Field number > 9900', { filter: rule('subject.data.spend', 'gt', 9900) }],
  ['Field select = gold', { filter: rule('subject.data.tier', 'eq', 'gold') }],
  ['Field multi-select has golf', { filter: rule('subject.data.interests', 'contains', 'golf') }],
  [
    'Field date in the next 30 days',
    { filter: rule('subject.data.renewal', 'within_next', { amount: 30, unit: 'days' }) },
  ],
  [
    'Field date anniversary in 7 days',
    { filter: rule('subject.data.renewal', 'anniversary_within', { amount: 7 }) },
  ],
  [
    'No activity for 60 days',
    { filter: rule('subject.lastActivityAt', 'more_than_ago', { amount: 60, unit: 'days' }) },
  ],
  [
    'Birthday in the next 7 days',
    { filter: rule('subject.birthDate', 'anniversary_within', { amount: 7 }) },
  ],
  [
    'Company field: region is north',
    { filter: rule('subject.company.data.region', 'eq', 'north') },
  ],
  ['First name is', { filter: rule('subject.firstName', 'eq', 'Firstc4ca42') }],
  ['Search box, two words', { search: 'first c4ca 8000' }],
  ['Company industry is Retail', { filter: rule('subject.company.industry', 'eq', 'Retail') }],
  [
    'Tag and spend > 5000 and created this year',
    {
      filter: allOf(
        { path: 'subject.tagIds', op: 'contains', value: 'tag5' },
        { path: 'subject.data.spend', op: 'gt', value: 5000 },
        { path: 'subject.createdAt', op: 'within_last', value: { amount: 12, unit: 'months' } },
      ),
    },
  ],
];

const COMPANY_CASES: [string, { filter?: string; search?: string }][] = [
  ['Companies, no filter', {}],
  ['Companies, search', { search: 'company 777' }],
  ['Companies, region is north', { filter: rule('subject.data.region', 'eq', 'north') }],
  ['Companies, industry is Retail', { filter: rule('subject.industry', 'eq', 'Retail') }],
];

const PRODUCT_LIST = { status: 'active', all: false } as const;

/** Runs `fn` as the owner in the organisation's scope, as a request does. */
type InOrg = <T>(fn: (tx: Db) => Promise<T>) => () => Promise<T>;

/** Customer and company lists, details and side panels. */
const contactCases = (inOrg: InOrg): BenchCase[] => [
  ...CUSTOMER_CASES.map(([label, query]): BenchCase => [
    label,
    inOrg((tx) => listCustomers(tx, { ...FIRST_PAGE, ...query })),
  ]),
  ['Customers, second page', inOrg((tx) => listCustomers(tx, nextPage('c100')))],
  ['Customer detail', inOrg((tx) => getCustomer(tx, 'c100'))],
  ["Customer's companies", inOrg((tx) => customerCompaniesOf(tx, 'c100'))],
  ...COMPANY_CASES.map(([label, query]): BenchCase => [
    label,
    inOrg((tx) => listCompanies(tx, { ...FIRST_PAGE, ...query })),
  ]),
  ['Company detail', inOrg((tx) => getCompany(tx, 'co100'))],
  ["Company's people", inOrg((tx) => companyPeople(tx, 'co100'))],
];

/** Products, timelines, the inbox, the audit log and global search. */
const recordCases = (inOrg: InOrg): BenchCase[] => [
  ['Products, no filter', inOrg((tx) => listProducts(tx, { ...FIRST_PAGE, ...PRODUCT_LIST }))],
  [
    'Products, search',
    inOrg((tx) => listProducts(tx, { ...FIRST_PAGE, ...PRODUCT_LIST, search: 'p1234' })),
  ],
  [
    'Timeline, busy customer',
    inOrg((tx) => listActivities(tx, { ...FIRST_PAGE, targetType: 'customer', targetId: 'c1' })),
  ],
  [
    'Timeline, busy customer, notes',
    inOrg((tx) =>
      listActivities(tx, {
        ...FIRST_PAGE,
        targetType: 'customer',
        targetId: 'c1',
        kind: 'notes',
      }),
    ),
  ],
  [
    'Timeline, busy customer, text',
    inOrg((tx) =>
      listActivities(tx, {
        ...FIRST_PAGE,
        targetType: 'customer',
        targetId: 'c1',
        q: 'order 42',
      }),
    ),
  ],
  [
    'Timeline, company with its people',
    inOrg((tx) =>
      listActivities(tx, {
        ...FIRST_PAGE,
        targetType: 'company',
        targetId: 'co100',
        includeRelated: true,
      }),
    ),
  ],
  [
    "Member's activity",
    inOrg((tx) => listMemberActivities(tx, { ...FIRST_PAGE, actorId: 'user7' })),
  ],
  ['Notifications inbox', inOrg((tx) => listNotifications(tx, FIRST_PAGE))],
  ['Notifications, unread', inOrg((tx) => listNotifications(tx, { ...FIRST_PAGE, unread: true }))],
  ['Notifications, unread count', inOrg((tx) => unreadCount(tx))],
  ['Audit log', inOrg((tx) => listAudit(tx, FIRST_PAGE))],
  ['Audit log, by action', inOrg((tx) => listAudit(tx, { ...FIRST_PAGE, action: 'tag.created' }))],
  ['Audit log, by member', inOrg((tx) => listAudit(tx, { ...FIRST_PAGE, actorId: 'user7' }))],
  ['Audit log, text', inOrg((tx) => listAudit(tx, { ...FIRST_PAGE, q: 'customer 4242' }))],
  ['Global search, email', inOrg((tx) => searchRecords(tx, { q: 'p12345@', limit: 5 }))],
  ['Global search, word', inOrg((tx) => searchRecords(tx, { q: 'first', limit: 5 }))],
];

export const benchCases = ({ orgId, owner }: Bench): BenchCase[] => {
  const inOrg: InOrg = (fn) => () => runAs(owner, () => withOrg(orgId, fn));

  return [...contactCases(inOrg), ...recordCases(inOrg)];
};
