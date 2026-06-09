import {
  replaceOutputPlaceholders,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import {
  IMobileAmount,
  IPaidAmount,
  IPosOrderItem,
} from '~/modules/pos/@types/orders';
import { IPosDocument } from '~/modules/pos/@types/pos';
import { IPosOrderUpsertInput } from '~/modules/pos/db/models/Orders';

type TReceiveActionInput =
  TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS];

type TCreatePosOrderConfig = Record<string, unknown>;

type TPosOrderItemInput = IPosOrderItem & {
  _id: string;
  orderId: string;
};

type TPaidAmountInput = IPaidAmount & {
  _id: string;
  info?: unknown;
};

type TMobileAmountInput = IMobileAmount & {
  _id: string;
};

const STATIC_REFERENCE_TOKEN_REGEXP =
  /^\[\[\s*(?:product|customer|company|user)\.([^\]]+?)\s*\]\]$/;

const unwrapStaticReferenceToken = (value: string) => {
  const match = value.match(STATIC_REFERENCE_TOKEN_REGEXP);

  return match?.[1]?.trim() || value;
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const getString = (
  data: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = data[key];

  if (value === undefined || value === null) {
    return undefined;
  }

  const stringValue = String(value).trim();

  return stringValue ? unwrapStaticReferenceToken(stringValue) : undefined;
};

const getNumber = (
  data: Record<string, unknown>,
  key: string,
): number | undefined => {
  const value = data[key];

  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const getBoolean = (
  data: Record<string, unknown>,
  key: string,
): boolean | undefined => {
  const value = data[key];

  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return ['true', '1', 'yes'].includes(String(value).toLowerCase());
};

const parseDate = (value: unknown): Date | undefined => {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const parseJsonValue = <T>(value: unknown, fallback: T): T => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value !== 'string') {
    return value as T;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const toStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(toStringList);
  }

  if (value === undefined || value === null || value === '') {
    return [];
  }

  return String(value)
    .split(',')
    .map((item) => unwrapStaticReferenceToken(item.trim()))
    .filter(Boolean);
};

const normalizeItems = (
  rawItems: unknown,
  config: TCreatePosOrderConfig,
  orderId: string,
): TPosOrderItemInput[] => {
  const parsedItems = parseJsonValue<unknown[]>(rawItems, []);
  const configProductIds = [
    ...toStringList(config.productIds),
    ...toStringList(config.productId),
  ];

  const baseItems = parsedItems.length
    ? parsedItems
    : configProductIds.length
      ? configProductIds.map((productId) => ({
          productId,
          count: getNumber(config, 'count') || 1,
          unitPrice: getNumber(config, 'unitPrice') || 0,
        }))
      : [];

  return baseItems.flatMap((item) => {
    const record = toRecord(item);
    const productId = getString(record, 'productId');

    if (!productId) {
      return [];
    }

    return [
      {
        _id: getString(record, '_id') || nanoid(),
        orderId,
        productId,
        count: getNumber(record, 'count') || 1,
        unitPrice: getNumber(record, 'unitPrice'),
        discountAmount: getNumber(record, 'discountAmount'),
        discountPercent: getNumber(record, 'discountPercent'),
        bonusCount: getNumber(record, 'bonusCount'),
        bonusVoucherId: getString(record, 'bonusVoucherId'),
        isPackage: getBoolean(record, 'isPackage'),
        isTake: getBoolean(record, 'isTake'),
        manufacturedDate: getString(record, 'manufacturedDate'),
        description: getString(record, 'description'),
        closeDate: parseDate(record.closeDate),
      },
    ];
  });
};

const normalizePaidAmounts = (
  rawPaidAmounts: unknown,
  config: TCreatePosOrderConfig,
): TPaidAmountInput[] | undefined => {
  const parsedPaidAmounts = parseJsonValue<unknown[]>(rawPaidAmounts, []);
  const paymentType = getString(config, 'paymentType');
  const paymentAmount = getNumber(config, 'paymentAmount');
  const basePaidAmounts = parsedPaidAmounts.length
    ? parsedPaidAmounts
    : paymentType && paymentAmount !== undefined
      ? [{ type: paymentType, amount: paymentAmount }]
      : [];

  const paidAmounts = basePaidAmounts.flatMap((item) => {
    const record = toRecord(item);
    const type = getString(record, 'type');

    if (!type) {
      return [];
    }

    return [
      {
        _id: getString(record, '_id') || nanoid(),
        type,
        amount: getNumber(record, 'amount') || 0,
        info: parseJsonValue(record.info, record.info),
      },
    ];
  });

  return paidAmounts.length ? paidAmounts : undefined;
};

const normalizeMobileAmounts = (rawMobileAmounts: unknown) => {
  const parsedMobileAmounts = parseJsonValue<unknown[]>(rawMobileAmounts, []);

  return parsedMobileAmounts
    .map((item) => {
      const record = toRecord(item);
      const amount = getNumber(record, 'amount');

      if (amount === undefined) {
        return null;
      }

      return {
        _id: getString(record, '_id') || nanoid(),
        amount,
      };
    })
    .filter((item): item is TMobileAmountInput => Boolean(item));
};

const calculateItemsAmount = (items: TPosOrderItemInput[]) =>
  items.reduce((total, item) => total + item.count * (item.unitPrice || 0), 0);

const findPos = async (models: IModels, config: TCreatePosOrderConfig) => {
  const posId = getString(config, 'posId');
  const posToken = getString(config, 'posToken');

  if (posId) {
    return await models.Pos.findOne({ _id: posId }).lean();
  }

  if (posToken) {
    return await models.Pos.findOne({ token: posToken }).lean();
  }

  return null;
};

const inferTargetCustomer = (
  execution: TReceiveActionInput['execution'],
  config: TCreatePosOrderConfig,
) => {
  const customerId = getString(config, 'customerId');
  const customerType = getString(config, 'customerType');

  if (customerId) {
    return {
      customerId,
      customerType: customerType || 'customer',
    };
  }

  if (execution.triggerType === 'core:contacts.customers') {
    return {
      customerId: execution.targetId,
      customerType: 'customer',
    };
  }

  if (execution.triggerType === 'core:contacts.companies') {
    return {
      customerId: execution.targetId,
      customerType: 'company',
    };
  }

  return {
    customerId: undefined,
    customerType: customerType || 'customer',
  };
};

const buildPosOrderDocument = ({
  config,
  execution,
  pos,
}: {
  config: TCreatePosOrderConfig;
  execution: TReceiveActionInput['execution'];
  pos: IPosDocument;
}): IPosOrderUpsertInput => {
  const orderId = getString(config, '_id') || nanoid();
  const items = normalizeItems(config.items, config, orderId);
  const itemsAmount = calculateItemsAmount(items);
  const totalAmount = getNumber(config, 'totalAmount') ?? itemsAmount;
  const finalAmount = getNumber(config, 'finalAmount') ?? totalAmount;
  const paidDate = parseDate(config.paidDate);
  const { customerId, customerType } = inferTargetCustomer(execution, config);

  return {
    _id: orderId,
    createdAt: parseDate(config.createdAt) || new Date(),
    status: getString(config, 'status') || 'new',
    paidDate,
    dueDate: parseDate(config.dueDate),
    number: getString(config, 'number') || `AUTO-${nanoid(8)}`,
    customerId,
    customerType,
    cashAmount: getNumber(config, 'cashAmount'),
    mobileAmount: getNumber(config, 'mobileAmount'),
    mobileAmounts: normalizeMobileAmounts(config.mobileAmounts),
    paidAmounts: normalizePaidAmounts(config.paidAmounts, config),
    totalAmount,
    finalAmount,
    shouldPrintEbarimt: getBoolean(config, 'shouldPrintEbarimt'),
    printedEbarimt: getBoolean(config, 'printedEbarimt'),
    billType: getString(config, 'billType'),
    billId: getString(config, 'billId'),
    registerNumber: getString(config, 'registerNumber'),
    oldBillId: getString(config, 'oldBillId'),
    type: getString(config, 'type') || 'take',
    userId: getString(config, 'userId') || execution.target?.userId,
    items,
    branchId: getString(config, 'branchId') || pos.branchId || '',
    subBranchId: getString(config, 'subBranchId') || '',
    departmentId: getString(config, 'departmentId') || pos.departmentId || '',
    posToken: pos.token,
    posId: pos._id,
    deliveryInfo: parseJsonValue(config.deliveryInfo, undefined),
    description: getString(config, 'description'),
    isPre: getBoolean(config, 'isPre'),
    origin: getString(config, 'origin') || 'automation',
    taxInfo: parseJsonValue(config.taxInfo, undefined),
    convertDealId: getString(config, 'convertDealId'),
    returnInfo: parseJsonValue(config.returnInfo, undefined),
    subscriptionInfo: parseJsonValue(config.subscriptionInfo, undefined),
    extraInfo: parseJsonValue(config.extraInfo, undefined),
  };
};

export const createPosOrderAction = async ({
  models,
  subdomain,
  action,
  execution,
}: {
  models: IModels;
  subdomain: string;
  action: TReceiveActionInput['action'];
  execution: TReceiveActionInput['execution'];
}) => {
  const config = (await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: action.config || {},
    defaultValue: '',
  })) as TCreatePosOrderConfig;
  const pos = await findPos(models, config);

  if (!pos) {
    throw new Error('Create POS order action requires a valid POS');
  }

  const document = buildPosOrderDocument({
    config,
    execution,
    pos,
  });
  const { newOrder } = await models.PosOrders.createOrUpdate(document);

  return {
    name: newOrder.number,
    targetId: newOrder._id,
    orderId: newOrder._id,
    number: newOrder.number,
    status: newOrder.status,
    posId: newOrder.posId,
    posToken: newOrder.posToken,
  };
};
