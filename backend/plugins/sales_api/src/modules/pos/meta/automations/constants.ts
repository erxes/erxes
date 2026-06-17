import {
  AutomationConstants,
  TAutomationRuntimeOutputDefinition,
  TAutomationSetPropertyTarget,
} from 'erxes-api-shared/core-modules';
import { IPosOrder } from '~/modules/pos/@types/orders';

type TPosOrderAutomationTarget = IPosOrder & {
  _id?: string;
  previousStatus?: string;
  currentStatus?: string;
  previousPaidDate?: Date | string;
  currentPaidDate?: Date | string;
};

export const POS_ORDER_EVENT_TYPES = {
  CREATED: 'created',
  PAID: 'paid',
  RETURNED: 'returned',
  STATUS_CHANGED: 'statusChanged',
  PAYMENT_CHANGED: 'paymentChanged',
  DELIVERY_COMPLETED: 'deliveryCompleted',
} as const;

export const POS_ORDER_EVENT_OPTIONS = [
  { value: POS_ORDER_EVENT_TYPES.CREATED, label: 'Order created' },
  { value: POS_ORDER_EVENT_TYPES.PAID, label: 'Order paid' },
  { value: POS_ORDER_EVENT_TYPES.RETURNED, label: 'Order returned' },
  { value: POS_ORDER_EVENT_TYPES.STATUS_CHANGED, label: 'Status changed' },
  { value: POS_ORDER_EVENT_TYPES.PAYMENT_CHANGED, label: 'Payment changed' },
  {
    value: POS_ORDER_EVENT_TYPES.DELIVERY_COMPLETED,
    label: 'Delivery completed',
  },
];

const POS_ORDER_SET_PROPERTY_TARGETS: TAutomationSetPropertyTarget[] = [
  {
    label: 'POS order',
    type: 'sales:pos.orders',
    source: 'target',
    cardinality: 'one',
  },
];

const POS_ORDER_OUTPUT: TAutomationRuntimeOutputDefinition<TPosOrderAutomationTarget> =
  {
    variables: [
      { key: '_id', label: 'POS order ID', field: '_id' },
      { key: 'number', label: 'Order number' },
      { key: 'status', label: 'Status' },
      { key: 'previousStatus', label: 'Previous status' },
      { key: 'currentStatus', label: 'Current status' },
      { key: 'createdAt', label: 'Created at' },
      { key: 'paidDate', label: 'Paid date' },
      { key: 'previousPaidDate', label: 'Previous paid date' },
      { key: 'currentPaidDate', label: 'Current paid date' },
      { key: 'dueDate', label: 'Due date' },
      {
        key: 'customerId',
        label: 'Customer ID',
        exposure: 'reference',
        field: 'customerId',
        referenceType: 'core:customer',
      },
      { key: 'customerType', label: 'Customer type' },
      { key: 'cashAmount', label: 'Cash amount' },
      { key: 'mobileAmount', label: 'Mobile amount' },
      { key: 'totalAmount', label: 'Total amount' },
      { key: 'finalAmount', label: 'Final amount' },
      { key: 'type', label: 'Order type' },
      {
        key: 'userId',
        label: 'Created user',
        exposure: 'reference',
        field: 'userId',
        referenceType: 'core:user',
      },
      { key: 'branchId', label: 'Branch ID' },
      { key: 'departmentId', label: 'Department ID' },
      { key: 'subBranchId', label: 'Sub branch ID' },
      { key: 'posId', label: 'POS ID' },
      { key: 'posToken', label: 'POS token' },
      { key: 'billId', label: 'Bill ID' },
      { key: 'registerNumber', label: 'Register number' },
      { key: 'convertDealId', label: 'Converted deal ID' },
      { key: 'items.productIds', label: 'Product IDs' },
      { key: 'items.count', label: 'Items count' },
      { key: 'items.amount', label: 'Items amount' },
      { key: 'paymentTypes', label: 'Payment types' },
      { key: 'subscriptionInfo.status', label: 'Subscription status' },
      { key: 'link', label: 'POS order link' },
    ],
    propertySource: {
      key: 'properties',
      label: 'POS order properties',
      propertyType: 'sales:pos.orders',
    },
    resolvers: {
      'items.productIds': ({ source }) =>
        (source.items || [])
          .map((item) => item.productId)
          .filter(Boolean)
          .join(', '),
      'items.count': ({ source }) =>
        (source.items || []).reduce((total, item) => total + item.count, 0),
      'items.amount': ({ source }) =>
        (source.items || []).reduce(
          (total, item) => total + item.count * (item.unitPrice || 0),
          0,
        ),
      paymentTypes: ({ source }) =>
        (source.paidAmounts || [])
          .map((paidAmount) => paidAmount.type)
          .filter(Boolean)
          .join(', '),
      link: ({ source }) =>
        source.posId && source._id
          ? `/sales/pos/${source.posId}/orders?pos_order_id=${source._id}`
          : '',
    },
  };

export const posAutomationConstants = {
  triggers: [
    {
      moduleName: 'pos',
      collectionName: 'orders',
      relationType: 'event',
      icon: 'IconShoppingCart',
      label: 'POS order event',
      description:
        'Start this workflow when a POS order matches the selected event.',
      isCustom: true,
      output: POS_ORDER_OUTPUT,
      setPropertyTargets: POS_ORDER_SET_PROPERTY_TARGETS,
    },
  ],
  actions: [
    {
      moduleName: 'pos',
      collectionName: 'orders',
      method: 'create',
      icon: 'IconShoppingCartPlus',
      label: 'Create POS order',
      description: 'Create a POS order record.',
      isTargetSource: true,
      targetSourceType: 'sales:pos.orders',
      allowTargetFromActions: true,
      output: POS_ORDER_OUTPUT,
      setPropertyTargets: POS_ORDER_SET_PROPERTY_TARGETS,
    },
  ],
};
