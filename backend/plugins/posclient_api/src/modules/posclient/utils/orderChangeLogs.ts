import { IModels } from '~/connectionResolvers';
import { IOrder } from '../@types/orders';
import {
  IOrderChangeEntry,
  OrderChangeLogAction,
} from '../@types/orderChangeLogs';

const orderFields: (keyof IOrder)[] = [
  'status',
  'saleStatus',
  'dueDate',
  'customerId',
  'customerType',
  'brokerId',
  'brokerType',
  'type',
  'totalAmount',
  'directDiscount',
  'directIsAmount',
  'billType',
  'registerNumber',
  'slotCode',
  'branchId',
  'subBranchId',
  'departmentId',
  'taxInfo',
  'deliveryInfo',
  'description',
  'extraInfo',
  'returnInfo',
  'cashAmount',
  'paidAmounts',
];

const normalizeValue = (value: unknown): unknown => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, normalizeValue(entry)]),
    );
  }
  return value ?? null;
};

export const getOrderChangeSnapshot = async (
  models: IModels,
  orderId: string,
): Promise<Record<string, unknown>> => {
  const order = await models.Orders.getOrder(orderId);
  const items = await models.OrderItems.find({ orderId })
    .sort({ _id: 1 })
    .lean();

  return {
    ...Object.fromEntries(
      orderFields.map((field) => [field, normalizeValue(order[field])]),
    ),
    // Creation timestamps and Mongo metadata are not editable item values.
    items: items.map((item) =>
      normalizeValue(
        Object.fromEntries(
          Object.entries(item).filter(
            ([field]) => !['createdAt', 'orderId', '__v'].includes(field),
          ),
        ),
      ),
    ),
  };
};

export const saveOrderChangeSnapshot = async (
  models: IModels,
  orderId: string,
  posToken: string,
  userId: string | undefined,
  before: Awaited<ReturnType<typeof getOrderChangeSnapshot>>,
  action: OrderChangeLogAction = 'update',
) => {
  const after = await getOrderChangeSnapshot(models, orderId);
  const changes: IOrderChangeEntry[] = Object.keys({
    ...before,
    ...after,
  }).flatMap((field) => {
    const oldValue = before[field];
    const newValue = after[field];
    return JSON.stringify(oldValue) === JSON.stringify(newValue)
      ? []
      : [{ field, oldValue, newValue }];
  });

  if (changes.length) {
    await models.OrderChangeLogs.createLog({
      orderId,
      posToken,
      userId,
      action,
      changes,
    });
  }
};
