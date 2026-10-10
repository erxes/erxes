export type ReportFilterField =
  | 'accountCategoryId'
  | 'accountIds'
  | 'branchId'
  | 'departmentId'
  | 'customerId'
  | 'customerTagIds'
  | 'companyTagIds'
  | 'productCategoryId'
  | 'productIds'
  | 'productSearchValue'
  | 'fixedAssetCategoryId'
  | 'fixedAssetIds'
  | 'fixedAssetSearchValue'
  | 'createdUserId'
  | 'modifiedUserId'
  | 'assignedUserId'
  | 'isTemp'
  | 'isOutBalance'
  | 'trKind'
  | 'groupKey'
  | 'isMore'
  | 'unhideZero'
  | 'fromDate'
  | 'toDate';

export type ReportFilterGroup =
  | 'accounts'
  | 'contacts'
  | 'inventory'
  | 'fixedAssets'
  | 'organization'
  | 'ownership'
  | 'report';

export type ReportFilterDefinition = {
  field: ReportFilterField;
  group: ReportFilterGroup;
  label: string;
  queryParam: string;
};

export const REPORT_FILTER_GROUP_ORDER: ReportFilterGroup[] = [
  'accounts',
  'contacts',
  'inventory',
  'fixedAssets',
  'organization',
  'ownership',
  'report',
];

const define = (
  field: ReportFilterField,
  group: ReportFilterGroup,
  label: string,
  queryParam: string = field,
): ReportFilterDefinition => ({ field, group, label, queryParam });

export const REPORT_FILTER_DEFINITIONS: Record<
  ReportFilterField,
  ReportFilterDefinition
> = {
  accountCategoryId: define(
    'accountCategoryId',
    'accounts',
    'account-category-label-2',
  ),
  accountIds: define('accountIds', 'accounts', 'account'),
  isTemp: define(
    'isTemp',
    'accounts',
    'temporary-account-label',
    'accountIsTemp',
  ),
  isOutBalance: define(
    'isOutBalance',
    'accounts',
    'off-balance-sheet',
    'accountIsOutBalance',
  ),
  customerId: define('customerId', 'contacts', 'contact'),
  customerTagIds: define('customerTagIds', 'contacts', 'contact-tag'),
  companyTagIds: define('companyTagIds', 'contacts', 'company-tag'),
  productCategoryId: define(
    'productCategoryId',
    'inventory',
    'product-category-label',
  ),
  productIds: define('productIds', 'inventory', 'inventory-label'),
  productSearchValue: define(
    'productSearchValue',
    'inventory',
    'product-code-or-name',
  ),
  fixedAssetCategoryId: define(
    'fixedAssetCategoryId',
    'fixedAssets',
    'asset-category',
  ),
  fixedAssetIds: define('fixedAssetIds', 'fixedAssets', 'fixed-assets'),
  fixedAssetSearchValue: define(
    'fixedAssetSearchValue',
    'fixedAssets',
    'asset-code-or-name',
  ),
  branchId: define('branchId', 'organization', 'branch'),
  departmentId: define('departmentId', 'organization', 'department'),
  createdUserId: define('createdUserId', 'ownership', 'created-by'),
  modifiedUserId: define('modifiedUserId', 'ownership', 'modified-by'),
  assignedUserId: define('assignedUserId', 'ownership', 'assigned-user'),
  trKind: define('trKind', 'report', 'transaction-type'),
  groupKey: define('groupKey', 'report', 'group-by'),
  isMore: define('isMore', 'report', 'details'),
  unhideZero: define('unhideZero', 'report', 'show-empty-rows'),
  fromDate: define('fromDate', 'report', 'start-date'),
  toDate: define('toDate', 'report', 'end-date'),
};

const BASE_FIELDS: ReportFilterField[] = [
  'accountCategoryId',
  'accountIds',
  'isTemp',
  'isOutBalance',
  'branchId',
  'departmentId',
  'createdUserId',
  'modifiedUserId',
  'assignedUserId',
  'trKind',
  'groupKey',
  'isMore',
  'unhideZero',
  'fromDate',
  'toDate',
];

const CONTACT_FIELDS: ReportFilterField[] = [
  'customerId',
  'customerTagIds',
  'companyTagIds',
];

const PRODUCT_FIELDS: ReportFilterField[] = [
  'productCategoryId',
  'productIds',
  'productSearchValue',
];

const FIXED_ASSET_FIELDS: ReportFilterField[] = [
  'fixedAssetCategoryId',
  'fixedAssetIds',
  'fixedAssetSearchValue',
];

const withFields = (...groups: ReportFilterField[][]) => groups.flat();

export const REPORT_FILTERS_BY_REPORT: Record<string, ReportFilterField[]> = {
  ac: withFields(BASE_FIELDS, CONTACT_FIELDS),
  tb: withFields(BASE_FIELDS, CONTACT_FIELDS),
  mb: withFields(BASE_FIELDS, CONTACT_FIELDS),
  mj: withFields(BASE_FIELDS, CONTACT_FIELDS),
  mjs: withFields(BASE_FIELDS, CONTACT_FIELDS),
  fund: withFields(BASE_FIELDS, CONTACT_FIELDS),
  debt: withFields(BASE_FIELDS, CONTACT_FIELDS),
  invCost: withFields(BASE_FIELDS, PRODUCT_FIELDS),
  invSale: withFields(BASE_FIELDS, PRODUCT_FIELDS, CONTACT_FIELDS),
  invSaleCost: withFields(BASE_FIELDS, PRODUCT_FIELDS, CONTACT_FIELDS),
  invSaleCostPeriod: withFields(BASE_FIELDS, PRODUCT_FIELDS, CONTACT_FIELDS),
  invByPrice: withFields(BASE_FIELDS, PRODUCT_FIELDS),
  invProfit: withFields(BASE_FIELDS, PRODUCT_FIELDS),
  invShipper: withFields(BASE_FIELDS, PRODUCT_FIELDS),
  invSaleDaily: withFields(BASE_FIELDS, PRODUCT_FIELDS, CONTACT_FIELDS),
  invSellerSubsys: BASE_FIELDS,
  fxa: withFields(BASE_FIELDS, FIXED_ASSET_FIELDS),
};

export const getReportFilterDefinitions = (report: string) =>
  (REPORT_FILTERS_BY_REPORT[report] || BASE_FIELDS).map(
    (field) => REPORT_FILTER_DEFINITIONS[field],
  );
