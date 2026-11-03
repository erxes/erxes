import {
  GetExportData,
  GetExportDataArgs,
  IImportExportContext,
  buildExportCursorQuery,
  buildPropertyDataColumns,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { IDeal, IProductData } from '~/modules/sales/@types';
import { generateFilter } from '@/sales/graphql/resolvers/queries/deals';
import {
  ExportRow,
  fetchBranchNames,
  fetchCompanies,
  fetchCustomers,
  fetchDepartmentNames,
  fetchProducts,
  fetchTagNames,
  fetchUserNames,
  formatExportDate,
  formatExportValue,
  getCompanyLabel,
  getCustomerLabel,
  joinNames,
  pickExportFields,
  toExportNumber,
  uniqueIds,
  unwrapExportPayload,
} from '~/meta/export/utils';

/**
 * The export worker runs outside a request, so there is no signed-in user.
 * Filters that depend on one (pipeline visibility, "assigned to me") are
 * resolved against no user and therefore narrow rather than widen the result.
 */
const EXPORT_USER_ID = '';

type DealExportLookups = {
  stageById: Map<string, { name: string; pipelineId: string }>;
  pipelineById: Map<string, { name: string; boardId: string }>;
  boardNames: Map<string, string>;
  labelNames: Map<string, string>;
  tagNames: Map<string, string>;
  userNames: Map<string, string>;
  branchNames: Map<string, string>;
  departmentNames: Map<string, string>;
  customers: Awaited<ReturnType<typeof fetchCustomers>>;
  companies: Awaited<ReturnType<typeof fetchCompanies>>;
  products: Awaited<ReturnType<typeof fetchProducts>>;
};

/** A lean deal, with the schema fields the deal type does not declare. */
export type ExportDeal = Omit<IDeal, 'propertiesData'> & {
  _id: string;
  propertiesData?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  isComplete?: boolean;
  unUsedTotalAmount?: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const loadLookups = async (
  models: IModels,
  subdomain: string,
  deals: ExportDeal[],
): Promise<DealExportLookups> => {
  const stages = await models.Stages.find({
    _id: { $in: uniqueIds(deals.map((deal) => deal.stageId)) },
  })
    .select('_id name pipelineId')
    .lean();

  const pipelines = await models.Pipelines.find({
    _id: { $in: uniqueIds(stages.map((stage) => stage.pipelineId)) },
  })
    .select('_id name boardId')
    .lean();

  const boards = await models.Boards.find({
    _id: { $in: uniqueIds(pipelines.map((pipeline) => pipeline.boardId)) },
  })
    .select('_id name')
    .lean();

  const labels = await models.PipelineLabels.find({
    _id: { $in: uniqueIds(deals.flatMap((deal) => deal.labelIds || [])) },
  })
    .select('_id name')
    .lean();

  const [
    tagNames,
    userNames,
    branchNames,
    departmentNames,
    customers,
    companies,
    products,
  ] = await Promise.all([
    fetchTagNames(
      subdomain,
      uniqueIds(deals.flatMap((deal) => deal.tagIds || [])),
    ),
    fetchUserNames(
      subdomain,
      uniqueIds(
        deals.flatMap((deal) => [deal.userId, ...(deal.assignedUserIds || [])]),
      ),
    ),
    fetchBranchNames(
      subdomain,
      uniqueIds(deals.flatMap((deal) => deal.branchIds || [])),
    ),
    fetchDepartmentNames(
      subdomain,
      uniqueIds(deals.flatMap((deal) => deal.departmentIds || [])),
    ),
    fetchCustomers(subdomain, uniqueIds(deals.map((deal) => deal.customerId))),
    fetchCompanies(subdomain, uniqueIds(deals.map((deal) => deal.companyId))),
    fetchProducts(
      subdomain,
      uniqueIds(
        deals.flatMap((deal) =>
          (deal.productsData || []).map((product) => product.productId),
        ),
      ),
    ),
  ]);

  return {
    stageById: new Map(
      stages.map((stage) => [
        String(stage._id),
        { name: stage.name || '', pipelineId: stage.pipelineId || '' },
      ]),
    ),
    pipelineById: new Map(
      pipelines.map((pipeline) => [
        String(pipeline._id),
        { name: pipeline.name || '', boardId: pipeline.boardId || '' },
      ]),
    ),
    boardNames: new Map(
      boards.map((board) => [String(board._id), board.name || '']),
    ),
    labelNames: new Map(
      labels.map((label) => [String(label._id), label.name || '']),
    ),
    tagNames,
    userNames,
    branchNames,
    departmentNames,
    customers,
    companies,
    products,
  };
};

const describeProducts = (
  deal: ExportDeal,
  lookups: DealExportLookups,
): string => {
  return (deal.productsData || [])
    .map((productData) => {
      const product = productData.productId
        ? lookups.products.get(productData.productId)
        : undefined;
      const name = product?.name || productData.name || '';
      const title = [product?.code, name].filter(Boolean).join(' - ');

      return title ? `${title} x ${toExportNumber(productData.quantity)}` : '';
    })
    .filter(Boolean)
    .join('; ');
};

const summarizePayments = (deal: ExportDeal) => {
  const entries = Object.entries(deal.paymentsData || {}).filter(
    ([, payment]) => toExportNumber(payment?.amount) !== 0,
  );

  return {
    paidAmount: entries.reduce(
      (sum, [, payment]) => sum + toExportNumber(payment?.amount),
      0,
    ),
    payments: entries
      .map(([type, payment]) => `${type}: ${toExportNumber(payment?.amount)}`)
      .join('; '),
  };
};

/** Columns that turn the export into one row per deal product line. */
const PRODUCT_LINE_FIELDS = [
  'productCode',
  'productName',
  'productQuantity',
  'productUnitPrice',
  'productDiscount',
  'productAmount',
];

/** True when the export should repeat each deal once per product line. */
const wantsProductLines = (selectedFields?: string[]): boolean =>
  !selectedFields?.length ||
  selectedFields.some((field) => PRODUCT_LINE_FIELDS.includes(field));

/** Product-line columns for one entry of a deal's `productsData`. */
export const buildProductLineColumns = (
  productData: IProductData | undefined,
  lookups: Pick<DealExportLookups, 'products'>,
): ExportRow => {
  if (!productData) {
    return Object.fromEntries(PRODUCT_LINE_FIELDS.map((field) => [field, '']));
  }

  const product = productData.productId
    ? lookups.products.get(productData.productId)
    : undefined;

  return {
    productCode: product?.code || '',
    productName: product?.name || productData.name || '',
    productQuantity: toExportNumber(productData.quantity),
    productUnitPrice: toExportNumber(productData.unitPrice),
    productDiscount: toExportNumber(productData.discount),
    productAmount: toExportNumber(productData.amount),
  };
};
/** Builds one deal's export columns, with names resolved from the batch lookups. */
export const buildDealExportRow = (
  deal: ExportDeal,
  lookups: DealExportLookups,
): ExportRow => {
  const stage = lookups.stageById.get(String(deal.stageId));
  const pipeline = stage ? lookups.pipelineById.get(stage.pipelineId) : null;
  const customer = deal.customerId
    ? lookups.customers.get(deal.customerId)
    : undefined;
  const company = deal.companyId
    ? lookups.companies.get(deal.companyId)
    : undefined;
  const { paidAmount, payments } = summarizePayments(deal);
  const currencies = uniqueIds(
    (deal.productsData || []).map((product) => product.currency),
  );

  const row: ExportRow = {
    number: formatExportValue(deal.number),
    name: formatExportValue(deal.name),
    boardName: pipeline ? lookups.boardNames.get(pipeline.boardId) || '' : '',
    pipelineName: pipeline?.name || '',
    stageName: stage?.name || '',
    status: formatExportValue(deal.status),
    priority: formatExportValue(deal.priority),
    labels: joinNames(deal.labelIds, lookups.labelNames),
    tags: joinNames(deal.tagIds, lookups.tagNames),
    customer: customer ? getCustomerLabel(customer) : '',
    customerEmail: customer?.primaryEmail || '',
    customerPhone: customer?.primaryPhone || '',
    company: company ? getCompanyLabel(company) : '',
    createdBy: deal.userId ? lookups.userNames.get(deal.userId) || '' : '',
    assignedUsers: joinNames(deal.assignedUserIds, lookups.userNames),
    branches: joinNames(deal.branchIds, lookups.branchNames),
    departments: joinNames(deal.departmentIds, lookups.departmentNames),
    startDate: formatExportDate(deal.startDate),
    closeDate: formatExportDate(deal.closeDate),
    stageChangedDate: formatExportDate(deal.stageChangedDate),
    isComplete: formatExportValue(Boolean(deal.isComplete)),
    products: describeProducts(deal, lookups),
    productCount: (deal.productsData || []).length,
    currency: currencies.join('; '),
    totalAmount: toExportNumber(deal.totalAmount),
    unUsedTotalAmount: toExportNumber(deal.unUsedTotalAmount),
    paidAmount,
    payments,
    description: formatExportValue(deal.description),
    score: formatExportValue(deal.score),
    createdAt: formatExportDate(deal.createdAt),
    updatedAt: formatExportDate(deal.updatedAt),
  };

  if (isRecord(deal.propertiesData)) {
    Object.assign(
      row,
      buildPropertyDataColumns(deal.propertiesData, formatExportValue),
    );
  }

  return row;
};
/**
 * One CSV row per deal, or one per product line when a product column is
 * selected. Reads deals in `_id` order so the worker can page by the last `_id`.
 */
export async function getDealExportData(
  args: GetExportDataArgs,
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<ExportRow[]> {
  const { cursor, limit, filters, ids, selectedFields } =
    unwrapExportPayload<GetExportData>(args);

  if (!models) {
    throw new Error('Models not available in context');
  }

  // Selected rows are exported as chosen, and all at once: the worker's ids
  // cursor counts rows, and product lines make rows outnumber deals.
  const query = ids?.length
    ? { _id: { $in: ids } }
    : buildExportCursorQuery({
        baseQuery: await generateFilter(
          models,
          subdomain,
          EXPORT_USER_ID,
          filters || {},
        ),
        cursor,
        limit,
      }).query;

  const deals = await models.Deals.find(query)
    .sort({ _id: 1 })
    .limit(ids?.length ? ids.length : limit)
    .lean<ExportDeal[]>();

  if (!deals.length) {
    return [];
  }

  const lookups = await loadLookups(models, subdomain, deals);

  const productLines = wantsProductLines(selectedFields);

  // Every deal yields at least one row (a deal without products keeps empty
  // product columns), so each row's `_id` stays a valid deal cursor.
  return deals.flatMap((deal) => {
    const dealRow = buildDealExportRow(deal, lookups);
    const lines: Array<IProductData | undefined> =
      productLines && deal.productsData?.length
        ? deal.productsData
        : [undefined];

    return lines.map((productData) =>
      pickExportFields(
        String(deal._id),
        productLines
          ? { ...dealRow, ...buildProductLineColumns(productData, lookups) }
          : dealRow,
        selectedFields,
      ),
    );
  });
}
