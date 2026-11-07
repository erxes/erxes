import {
  GetExportData,
  GetExportDataArgs,
  IImportExportContext,
  buildExportCursorQuery,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { IPosOrder } from '@/pos/@types/orders';
import { generateFilterPosQuery } from '@/pos/graphql/resolvers/queries/orders';
import {
  ExportRow,
  fetchBranchNames,
  fetchCompanies,
  fetchCustomers,
  fetchDepartmentNames,
  fetchProducts,
  fetchUserNames,
  formatExportDate,
  formatExportValue,
  getCompanyLabel,
  getCustomerLabel,
  pickExportFields,
  toExportNumber,
  uniqueIds,
  unwrapExportPayload,
} from '~/meta/export/utils';

/** The export worker has no signed-in user, so `userId: 'me'` matches none. */
const EXPORT_USER_ID = '';

export type ExportPosOrder = IPosOrder & { _id: string };

export type PosOrderExportLookups = {
  posNames: Map<string, string>;
  dealNumbers: Map<string, string>;
  branchNames: Map<string, string>;
  departmentNames: Map<string, string>;
  userNames: Map<string, string>;
  customers: Awaited<ReturnType<typeof fetchCustomers>>;
  companies: Awaited<ReturnType<typeof fetchCompanies>>;
  products: Awaited<ReturnType<typeof fetchProducts>>;
};

const getCustomerType = (order: ExportPosOrder) =>
  order.customerType || 'customer';

const loadLookups = async (
  models: IModels,
  subdomain: string,
  orders: ExportPosOrder[],
): Promise<PosOrderExportLookups> => {
  const customerIdsByType = (type: string) =>
    uniqueIds(
      orders
        .filter((order) => getCustomerType(order) === type)
        .map((order) => order.customerId),
    );

  const posList = await models.Pos.find({
    token: { $in: uniqueIds(orders.map((order) => order.posToken)) },
  })
    .select('name token')
    .lean();

  const deals = await models.Deals.find({
    _id: { $in: uniqueIds(orders.map((order) => order.convertDealId)) },
  })
    .select('_id number name')
    .lean();

  const [
    branchNames,
    departmentNames,
    userNames,
    customers,
    companies,
    products,
  ] = await Promise.all([
    fetchBranchNames(
      subdomain,
      uniqueIds(orders.map((order) => order.branchId)),
    ),
    fetchDepartmentNames(
      subdomain,
      uniqueIds(orders.map((order) => order.departmentId)),
    ),
    fetchUserNames(
      subdomain,
      uniqueIds([
        ...orders.map((order) => order.userId),
        ...customerIdsByType('user'),
      ]),
    ),
    fetchCustomers(subdomain, customerIdsByType('customer')),
    fetchCompanies(subdomain, customerIdsByType('company')),
    fetchProducts(
      subdomain,
      uniqueIds(
        orders.flatMap((order) =>
          (order.items || []).map((item) => item.productId),
        ),
      ),
    ),
  ]);

  return {
    posNames: new Map(posList.map((pos) => [pos.token, pos.name || ''])),
    dealNumbers: new Map(
      deals.map((deal) => [String(deal._id), deal.number || deal.name || '']),
    ),
    branchNames,
    departmentNames,
    userNames,
    customers,
    companies,
    products,
  };
};

const describeCustomer = (
  order: ExportPosOrder,
  lookups: PosOrderExportLookups,
): string => {
  if (!order.customerId) {
    return '';
  }

  switch (getCustomerType(order)) {
    case 'company': {
      const company = lookups.companies.get(order.customerId);
      return company ? getCompanyLabel(company) : '';
    }
    case 'user':
      return lookups.userNames.get(order.customerId) || '';
    default: {
      const customer = lookups.customers.get(order.customerId);
      return customer ? getCustomerLabel(customer) : '';
    }
  }
};

const describeProducts = (
  order: ExportPosOrder,
  lookups: PosOrderExportLookups,
): string => {
  return (order.items || [])
    .map((item) => {
      const product = lookups.products.get(item.productId);
      const title = [product?.code, product?.name].filter(Boolean).join(' - ');

      return `${title || item.productId} x ${toExportNumber(item.count)}`;
    })
    .join('; ');
};

const summarizePayments = (order: ExportPosOrder) => {
  const paidAmounts = (order.paidAmounts || []).filter(
    (paid) => toExportNumber(paid.amount) !== 0,
  );

  const types = [
    toExportNumber(order.cashAmount) ? 'cash' : '',
    toExportNumber(order.mobileAmount) ? 'mobile' : '',
    ...paidAmounts.map((paid) => paid.type),
  ];

  return {
    paidAmounts: paidAmounts
      .map((paid) => `${paid.type}: ${toExportNumber(paid.amount)}`)
      .join('; '),
    paymentTypes: uniqueIds(types).join('; '),
  };
};

export const buildPosOrderExportRow = (
  order: ExportPosOrder,
  lookups: PosOrderExportLookups,
): ExportRow => {
  const items = order.items || [];
  const { paidAmounts, paymentTypes } = summarizePayments(order);

  return {
    number: formatExportValue(order.number),
    createdAt: formatExportDate(order.createdAt),
    paidDate: formatExportDate(order.paidDate),
    dueDate: formatExportDate(order.dueDate),
    posName: lookups.posNames.get(order.posToken) || '',
    status: formatExportValue(order.status),
    type: formatExportValue(order.type),
    origin: formatExportValue(order.origin),
    branch: lookups.branchNames.get(order.branchId) || '',
    department: lookups.departmentNames.get(order.departmentId) || '',
    cashier: order.userId ? lookups.userNames.get(order.userId) || '' : '',
    customerType: getCustomerType(order),
    customer: describeCustomer(order, lookups),
    billType: formatExportValue(order.billType),
    registerNumber: formatExportValue(order.registerNumber),
    billId: formatExportValue(order.billId),
    products: describeProducts(order, lookups),
    itemCount: items.reduce((sum, item) => sum + toExportNumber(item.count), 0),
    discountAmount: items.reduce(
      (sum, item) => sum + toExportNumber(item.discountAmount),
      0,
    ),
    totalAmount: toExportNumber(order.totalAmount),
    finalAmount: toExportNumber(order.finalAmount),
    cashAmount: toExportNumber(order.cashAmount),
    mobileAmount: toExportNumber(order.mobileAmount),
    paidAmounts,
    paymentTypes,
    dealNumber: order.convertDealId
      ? lookups.dealNumbers.get(order.convertDealId) || ''
      : '',
    returnedAt: formatExportDate(order.returnInfo?.returnAt),
    returnDescription: formatExportValue(order.returnInfo?.description),
    description: formatExportValue(order.description),
  };
};

/**
 * Reads one batch of POS orders for an export, with everything their rows
 * need. Orders are read in `_id` order so the worker can page by the last
 * `_id`; selected ids are read all at once, since item rows can outnumber
 * orders and the worker's ids cursor counts rows. Returns null when there is
 * nothing left to export.
 */
export const loadPosOrderBatch = async (
  args: GetExportDataArgs,
  { subdomain, models }: IImportExportContext<IModels>,
) => {
  const { cursor, limit, filters, ids, selectedFields } =
    unwrapExportPayload<GetExportData>(args);

  if (!models) {
    throw new Error('Models not available in context');
  }

  const query = ids?.length
    ? { _id: { $in: ids } }
    : buildExportCursorQuery({
        baseQuery: await generateFilterPosQuery(
          models,
          filters || {},
          EXPORT_USER_ID,
        ),
        cursor,
        limit,
      }).query;

  const orders = await models.PosOrders.find(query)
    .sort({ _id: 1 })
    .limit(ids?.length ? ids.length : limit)
    .lean<ExportPosOrder[]>();

  if (!orders.length) {
    return null;
  }

  return {
    orders,
    selectedFields,
    lookups: await loadLookups(models, subdomain, orders),
  };
};

/** One CSV row per POS order. */
export async function getPosOrdersExportData(
  args: GetExportDataArgs,
  ctx: IImportExportContext<IModels>,
): Promise<ExportRow[]> {
  const batch = await loadPosOrderBatch(args, ctx);

  if (!batch) {
    return [];
  }

  return batch.orders.map((order) =>
    pickExportFields(
      String(order._id),
      buildPosOrderExportRow(order, batch.lookups),
      batch.selectedFields,
    ),
  );
}
