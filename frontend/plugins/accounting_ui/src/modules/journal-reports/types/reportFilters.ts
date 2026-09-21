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
  accountCategoryId: define('accountCategoryId', 'accounts', 'Дансны бүлэг'),
  accountIds: define('accountIds', 'accounts', 'Данс'),
  isTemp: define('isTemp', 'accounts', 'Түр данс', 'accountIsTemp'),
  isOutBalance: define(
    'isOutBalance',
    'accounts',
    'Баланс бус',
    'accountIsOutBalance',
  ),
  customerId: define('customerId', 'contacts', 'Харилцагч'),
  customerTagIds: define('customerTagIds', 'contacts', 'Харилцагчийн tag'),
  companyTagIds: define('companyTagIds', 'contacts', 'Компанийн tag'),
  productCategoryId: define('productCategoryId', 'inventory', 'Барааны бүлэг'),
  productIds: define('productIds', 'inventory', 'Бараа материал'),
  productSearchValue: define(
    'productSearchValue',
    'inventory',
    'Барааны код, нэр',
  ),
  fixedAssetCategoryId: define(
    'fixedAssetCategoryId',
    'fixedAssets',
    'Хөрөнгийн бүлэг',
  ),
  fixedAssetIds: define('fixedAssetIds', 'fixedAssets', 'Үндсэн хөрөнгө'),
  fixedAssetSearchValue: define(
    'fixedAssetSearchValue',
    'fixedAssets',
    'Хөрөнгийн код, нэр',
  ),
  branchId: define('branchId', 'organization', 'Салбар'),
  departmentId: define('departmentId', 'organization', 'Хэлтэс'),
  createdUserId: define('createdUserId', 'ownership', 'Үүсгэсэн хэрэглэгч'),
  modifiedUserId: define('modifiedUserId', 'ownership', 'Зассан хэрэглэгч'),
  assignedUserId: define('assignedUserId', 'ownership', 'Хариуцсан хэрэглэгч'),
  trKind: define('trKind', 'report', 'Гүйлгээний төрөл'),
  groupKey: define('groupKey', 'report', 'Бүлэглэх'),
  unhideZero: define('unhideZero', 'report', 'Хоосон мөр харуулах'),
  fromDate: define('fromDate', 'report', 'Эхлэх огноо'),
  toDate: define('toDate', 'report', 'Дуусах огноо'),
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
