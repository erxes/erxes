import {
  replaceOutputPlaceholders,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { sendPosclientMessage } from '~/initWorker';
import { IPosOrderItem } from '~/modules/pos/@types/orders';
import { IPosDocument } from '~/modules/pos/@types/pos';

type TReceiveActionInput =
  TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS];

type TCreatePosOrderConfig = Record<string, unknown>;

type TPosOrderItemInput = IPosOrderItem & {
  _id: string;
};

type TPosclientOrderInput = {
  _id: string;
  items: TPosOrderItemInput[];
  totalAmount: number;
  type: string;
  posToken: string;
} & Record<string, unknown>;

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

const buildPosOrderInput = ({
  config,
  execution,
  pos,
}: {
  config: TCreatePosOrderConfig;
  execution: TReceiveActionInput['execution'];
  pos: IPosDocument;
}): TPosclientOrderInput => {
  const items = normalizeItems(config.items, config);
  // posclient recomputes this from the real product prices; it only survives
  // as `extraInfo.rawTotalAmount`
  const totalAmount =
    getNumber(config, 'totalAmount') ?? calculateItemsAmount(items);
  const { customerId, customerType } = inferTargetCustomer(execution, config);

  return {
    _id: getString(config, '_id') || nanoid(),
    items,
    totalAmount,
    type: getString(config, 'type') || 'take',
    customerId,
    customerType,
    branchId: getString(config, 'branchId') || pos.branchId || '',
    posToken: pos.token,
    description: getString(config, 'description'),
    origin: getString(config, 'origin') || 'automation',
    isPre: getBoolean(config, 'isPre'),
    dueDate: parseDate(config.dueDate),
    closeDate: parseDate(config.closeDate),
    slotCode: getString(config, 'slotCode'),
    deviceId: getString(config, 'deviceId'),
    buttonType: getString(config, 'buttonType'),
    couponCode: getString(config, 'couponCode'),
    voucherId: getString(config, 'voucherId'),
    brokerId: getString(config, 'brokerId'),
    brokerType: getString(config, 'brokerType'),
    directDiscount: getNumber(config, 'directDiscount'),
    directIsAmount: getBoolean(config, 'directIsAmount'),
    deliveryInfo: parseJsonValue(config.deliveryInfo, undefined),
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
  const orderDoc = buildPosOrderInput({ config, execution, pos });
  const order = await sendPosclientMessage({
    subdomain,
    pos,
    method: 'mutation',
    action: 'createOrder',
    input: { order: orderDoc },
  });

  if (!order?._id) {
    throw new Error(
      order?.message || 'Create POS order action could not create the order',
    );
  }

  return {
    name: order.number,
    targetId: order._id,
    orderId: order._id,
    number: order.number,
    status: order.status,
    posId: pos._id,
    posToken: order.posToken || pos.token,
    customerId: order.customerId,
    customerType: order.customerType,
    totalAmount: order.totalAmount,
    finalAmount: order.finalAmount,
  };
};
