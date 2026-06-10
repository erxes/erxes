import { nanoid } from 'nanoid';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IPosOrder } from '../../@types/orders';

const listSeparators = /[,;|\n]/;

type LookupMaps = {
  posById: Map<string, any>;
  posByToken: Map<string, any>;
  posByName: Map<string, any>;
  productById: Map<string, any>;
  productByCode: Map<string, any>;
  productByName: Map<string, any>;
};

export const POS_ITEM_IMPORT_HEADERS = [
  { label: 'Order ID', key: 'orderId' },
  { label: 'Item ID', key: 'itemId' },
  { label: 'Number', key: 'number' },
  { label: 'Created Date', key: 'createdAt' },
  { label: 'Paid Date', key: 'paidDate' },
  { label: 'Due Date', key: 'dueDate' },
  { label: 'Status', key: 'status' },
  { label: 'POS ID', key: 'posId' },
  { label: 'POS Token', key: 'posToken' },
  { label: 'POS Name', key: 'posName' },
  { label: 'Branch ID', key: 'branchId' },
  { label: 'Department ID', key: 'departmentId' },
  { label: 'Sub Branch ID', key: 'subBranchId' },
  { label: 'Cashier User ID', key: 'userId' },
  { label: 'Customer ID', key: 'customerId' },
  { label: 'Customer Type', key: 'customerType' },
  { label: 'Type', key: 'type' },
  { label: 'Bill Type', key: 'billType' },
  { label: 'Company RD', key: 'registerNumber' },
  { label: 'Product ID', key: 'productId' },
  { label: 'Product Code', key: 'productCode' },
  { label: 'Product Name', key: 'productName' },
  { label: 'Count', key: 'count' },
  { label: 'Unit Price', key: 'unitPrice' },
  { label: 'Discount', key: 'discountAmount' },
  { label: 'Discount Percent', key: 'discountPercent' },
  { label: 'Total Amount', key: 'totalAmount' },
  { label: 'Final Amount', key: 'finalAmount' },
  { label: 'Cash Amount', key: 'cashAmount' },
  { label: 'Mobile Amount', key: 'mobileAmount' },
  { label: 'Payment Type', key: 'paymentType' },
  { label: 'Paid Amounts JSON', key: 'paidAmounts' },
  { label: 'Description', key: 'description' },
  { label: 'Origin', key: 'origin' },
  { label: 'Item Description', key: 'itemDescription' },
];

export const parseDate = (value: unknown): Date | undefined => {
  if (!value) {
    return undefined;
  }

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const parseNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const roundMoney = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const parseList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (value === null || value === undefined) {
    return [];
  }

  return String(value)
    .split(listSeparators)
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalize = (value: unknown) => String(value || '').trim();

const parseJSONList = (value: unknown): any[] | undefined => {
  if (!value) {
    return undefined;
  }

  let parsed: unknown;

  try {
    parsed = typeof value === 'string' ? JSON.parse(value) : value;
  } catch (error: any) {
    throw new Error(
      `Invalid Paid Amounts JSON: ${error?.message || 'Unable to parse value'}`,
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Paid Amounts JSON must be an array');
  }

  return parsed;
};

const getOne = <T>(map: Map<string, T>, value: unknown) =>
  map.get(normalize(value));

export const buildLookupMaps = async (
  models: IModels,
  subdomain: string,
  rows: any[],
): Promise<LookupMaps> => {
  const posIds = new Set<string>();
  const posTokens = new Set<string>();
  const posNames = new Set<string>();
  const productIds = new Set<string>();
  const productCodes = new Set<string>();
  const productNames = new Set<string>();

  for (const row of rows) {
    if (normalize(row.posId)) posIds.add(normalize(row.posId));
    if (normalize(row.posToken)) posTokens.add(normalize(row.posToken));
    if (normalize(row.posName)) posNames.add(normalize(row.posName));
    if (normalize(row.productId)) productIds.add(normalize(row.productId));
    if (normalize(row.productCode))
      productCodes.add(normalize(row.productCode));
    if (normalize(row.productName))
      productNames.add(normalize(row.productName));
  }

  const posQuery: any = { $or: [] };
  if (posIds.size) posQuery.$or.push({ _id: { $in: [...posIds] } });
  if (posTokens.size) posQuery.$or.push({ token: { $in: [...posTokens] } });
  if (posNames.size) posQuery.$or.push({ name: { $in: [...posNames] } });

  const poss = posQuery.$or.length
    ? await models.Pos.find(posQuery).lean()
    : [];

  const productQuery: any = { $or: [] };
  if (productIds.size) productQuery.$or.push({ _id: { $in: [...productIds] } });
  if (productCodes.size)
    productQuery.$or.push({ code: { $in: [...productCodes] } });
  if (productNames.size)
    productQuery.$or.push({ name: { $in: [...productNames] } });

  const products = productQuery.$or.length
    ? await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'products',
        action: 'find',
        input: {
          query: productQuery,
          limit:
            productIds.size + productCodes.size + productNames.size || 1000,
        },
      })
    : [];

  if (!Array.isArray(products)) {
    throw new Error('Core products lookup returned an invalid response');
  }

  return {
    posById: new Map(poss.map((pos) => [String(pos._id), pos])),
    posByToken: new Map(poss.map((pos) => [String(pos.token), pos])),
    posByName: new Map(poss.map((pos) => [String(pos.name), pos])),
    productById: new Map(
      products.map((product) => [String(product._id), product]),
    ),
    productByCode: new Map(
      products.map((product) => [String(product.code), product]),
    ),
    productByName: new Map(
      products.map((product) => [String(product.name), product]),
    ),
  };
};

export const resolvePos = (row: any, lookups: LookupMaps) => {
  const posById = getOne(lookups.posById, row.posId);
  const posByToken = getOne(lookups.posByToken, row.posToken);
  const posByName = getOne(lookups.posByName, row.posName);
  const matchedPosIds = new Set(
    [posById, posByToken, posByName]
      .filter(Boolean)
      .map((matchedPos) => String(matchedPos._id)),
  );

  if (matchedPosIds.size > 1) {
    throw new Error(
      'Ambiguous POS match: POS ID, POS Token, and POS Name must refer to the same POS',
    );
  }

  const pos = posById || posByToken || posByName;

  if (!pos) {
    throw new Error(
      'POS ID, POS Token, or POS Name must match an existing POS',
    );
  }

  if (!pos.token) {
    throw new Error('Matched POS is missing a token');
  }

  return pos;
};

export const resolveProduct = (row: any, lookups: LookupMaps) => {
  const product =
    getOne(lookups.productById, row.productId) ||
    getOne(lookups.productByCode, row.productCode) ||
    getOne(lookups.productByName, row.productName);

  if (!product) {
    throw new Error(
      'Product ID, Product Code, or Product Name must match an existing product',
    );
  }

  return product;
};

export const getOrderGroupKey = (row: any) => {
  const orderId = normalize(row.orderId);
  if (orderId) {
    return `id:${orderId}`;
  }

  const posKey =
    normalize(row.posId) || normalize(row.posToken) || normalize(row.posName);
  const number = normalize(row.number);

  if (!posKey || !number) {
    return `row:${nanoid()}`;
  }

  return `pos-number:${posKey}:${number}`;
};

const buildPaidAmounts = (row: any, totalAmount: number) => {
  const parsed = parseJSONList(row.paidAmounts);

  if (parsed) {
    return parsed.map((amount) => ({
      ...amount,
      amount: parseNumber(amount.amount) ?? 0,
    }));
  }

  const paymentTypes = parseList(row.paymentType);

  if (!paymentTypes.length) {
    return [];
  }

  return paymentTypes.map((type, index) => ({
    _id: nanoid(),
    type,
    amount: index === 0 ? totalAmount : 0,
  }));
};

export const buildPosOrderDoc = async (
  models: IModels,
  rows: any[],
  lookups: LookupMaps,
  userId: string,
): Promise<IPosOrder & { _id: string }> => {
  const firstRow = rows[0];
  const pos = resolvePos(firstRow, lookups);
  const orderId = normalize(firstRow.orderId);
  const number = normalize(firstRow.number);
  const existingOrder = orderId
    ? await models.PosOrders.findOne({ _id: orderId }).lean()
    : number
      ? await models.PosOrders.findOne({
          number,
          posToken: pos.token,
        }).lean()
      : null;
  const resolvedOrderId = String(existingOrder?._id || orderId || nanoid());
  const items = rows.map((row) => {
    const product = resolveProduct(row, lookups);
    const count = parseNumber(row.count) ?? 1;
    const unitPrice =
      parseNumber(row.unitPrice) ?? parseNumber(row.totalAmount) ?? 0;
    const discountAmount = parseNumber(row.discountAmount) ?? 0;

    return {
      _id: normalize(row.itemId) || nanoid(),
      createdAt: parseDate(row.createdAt) || new Date(),
      productId: String(product._id),
      count,
      unitPrice,
      discountAmount,
      discountPercent: parseNumber(row.discountPercent),
      orderId: resolvedOrderId,
      description: normalize(row.itemDescription),
    };
  });

  const computedTotal = roundMoney(
    items.reduce((sum, item) => {
      const lineTotal =
        item.count * (item.unitPrice || 0) - (item.discountAmount || 0);

      return sum + roundMoney(lineTotal);
    }, 0),
  );
  const totalAmount = parseNumber(firstRow.totalAmount) ?? computedTotal;
  const paidAmounts = buildPaidAmounts(firstRow, totalAmount);

  return {
    _id: resolvedOrderId,
    createdAt:
      parseDate(firstRow.createdAt) || existingOrder?.createdAt || new Date(),
    status: normalize(firstRow.status) || existingOrder?.status || 'done',
    paidDate:
      parseDate(firstRow.paidDate) || existingOrder?.paidDate || new Date(),
    dueDate: parseDate(firstRow.dueDate) || existingOrder?.dueDate,
    number: number || existingOrder?.number || `import-${nanoid(8)}`,
    customerId: normalize(firstRow.customerId) || existingOrder?.customerId,
    customerType:
      normalize(firstRow.customerType) ||
      existingOrder?.customerType ||
      'customer',
    cashAmount:
      parseNumber(firstRow.cashAmount) ??
      existingOrder?.cashAmount ??
      totalAmount,
    mobileAmount:
      parseNumber(firstRow.mobileAmount) ?? existingOrder?.mobileAmount ?? 0,
    mobileAmounts: existingOrder?.mobileAmounts || [],
    paidAmounts: paidAmounts.length
      ? paidAmounts
      : existingOrder?.paidAmounts || [],
    totalAmount,
    finalAmount: parseNumber(firstRow.finalAmount) ?? totalAmount,
    billType: normalize(firstRow.billType) || existingOrder?.billType,
    registerNumber:
      normalize(firstRow.registerNumber) || existingOrder?.registerNumber,
    type: normalize(firstRow.type) || existingOrder?.type || 'eat',
    userId: normalize(firstRow.userId) || existingOrder?.userId || userId,
    items,
    branchId:
      normalize(firstRow.branchId) ||
      existingOrder?.branchId ||
      pos.branchId ||
      '',
    subBranchId:
      normalize(firstRow.subBranchId) || existingOrder?.subBranchId || '',
    departmentId:
      normalize(firstRow.departmentId) ||
      existingOrder?.departmentId ||
      pos.departmentId ||
      '',
    posToken: String(pos.token),
    posId: String(pos._id),
    description: normalize(firstRow.description) || existingOrder?.description,
    origin: normalize(firstRow.origin) || existingOrder?.origin || 'import',
  };
};
