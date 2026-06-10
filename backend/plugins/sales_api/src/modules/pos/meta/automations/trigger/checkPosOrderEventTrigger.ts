import { IPosOrder } from '~/modules/pos/@types/orders';
import { POS_ORDER_EVENT_TYPES } from '../constants';

type TPosOrderEventTriggerConfig = {
  eventType?: string;
  posId?: string;
  posToken?: string;
  orderType?: string;
  paymentType?: string;
  fromStatus?: string;
  toStatus?: string;
};

type TEventFieldChange = {
  prev?: unknown;
  current?: unknown;
};

type TEventUpdateDescription = {
  updated?: Record<string, TEventFieldChange>;
};

type TPosOrderEventTarget = IPosOrder & {
  _id?: string;
};

const RETURN_STATUSES = ['return', 'returned'];
const DELIVERY_DONE_STATUSES = ['done', 'complete', 'completed'];

const isTruthyDate = (value: unknown) => Boolean(value);

const hasUpdatedField = (
  eventUpdateDescription: TEventUpdateDescription | undefined,
  field: string,
) => Boolean(eventUpdateDescription?.updated?.[field]);

const getUpdatedField = (
  eventUpdateDescription: TEventUpdateDescription | undefined,
  field: string,
) => eventUpdateDescription?.updated?.[field];

const isCreateEvent = (eventUpdateDescription?: TEventUpdateDescription) =>
  !eventUpdateDescription?.updated;

const matchesScope = (
  target: TPosOrderEventTarget,
  config: TPosOrderEventTriggerConfig,
) => {
  if (config.posId && target.posId !== config.posId) {
    return false;
  }

  if (config.posToken && target.posToken !== config.posToken) {
    return false;
  }

  if (config.orderType && target.type !== config.orderType) {
    return false;
  }

  if (
    config.paymentType &&
    !(target.paidAmounts || []).some(
      (paidAmount) => paidAmount.type === config.paymentType,
    )
  ) {
    return false;
  }

  return true;
};

const checkStatusChanged = (
  target: TPosOrderEventTarget,
  config: TPosOrderEventTriggerConfig,
  eventUpdateDescription?: TEventUpdateDescription,
) => {
  if (isCreateEvent(eventUpdateDescription)) {
    return !config.toStatus || target.status === config.toStatus;
  }

  const statusChange = getUpdatedField(eventUpdateDescription, 'status');
  if (!statusChange || statusChange.prev === statusChange.current) {
    return false;
  }

  if (config.fromStatus && statusChange.prev !== config.fromStatus) {
    return false;
  }

  if (config.toStatus && statusChange.current !== config.toStatus) {
    return false;
  }

  return true;
};

const checkPaid = (
  target: TPosOrderEventTarget,
  eventUpdateDescription?: TEventUpdateDescription,
) => {
  if (isCreateEvent(eventUpdateDescription)) {
    return isTruthyDate(target.paidDate);
  }

  const paidDateChange = getUpdatedField(eventUpdateDescription, 'paidDate');

  return Boolean(
    paidDateChange &&
    !isTruthyDate(paidDateChange.prev) &&
    isTruthyDate(paidDateChange.current),
  );
};

const checkReturned = (
  target: TPosOrderEventTarget,
  eventUpdateDescription?: TEventUpdateDescription,
) => {
  if (isCreateEvent(eventUpdateDescription)) {
    return RETURN_STATUSES.includes(target.status);
  }

  const statusChange = getUpdatedField(eventUpdateDescription, 'status');
  const returnedByStatus =
    statusChange?.prev !== statusChange?.current &&
    RETURN_STATUSES.includes(String(statusChange?.current || ''));

  return (
    returnedByStatus || hasUpdatedField(eventUpdateDescription, 'returnInfo')
  );
};

const checkPaymentChanged = (
  eventUpdateDescription?: TEventUpdateDescription,
) => {
  if (isCreateEvent(eventUpdateDescription)) {
    return false;
  }

  return ['cashAmount', 'mobileAmount', 'mobileAmounts', 'paidAmounts'].some(
    (field) => hasUpdatedField(eventUpdateDescription, field),
  );
};

const checkDeliveryCompleted = (
  target: TPosOrderEventTarget,
  eventUpdateDescription?: TEventUpdateDescription,
) => {
  if (target.type !== 'delivery') {
    return false;
  }

  if (isCreateEvent(eventUpdateDescription)) {
    return DELIVERY_DONE_STATUSES.includes(target.status);
  }

  const statusChange = getUpdatedField(eventUpdateDescription, 'status');

  return Boolean(
    statusChange?.prev !== statusChange?.current &&
    DELIVERY_DONE_STATUSES.includes(String(statusChange?.current || '')),
  );
};

export const checkPosOrderEventTrigger = ({
  target,
  config,
  eventUpdateDescription,
}: {
  target: TPosOrderEventTarget;
  config: TPosOrderEventTriggerConfig;
  eventUpdateDescription?: TEventUpdateDescription;
}) => {
  if (!config?.eventType || !matchesScope(target, config)) {
    return false;
  }

  switch (config.eventType) {
    case POS_ORDER_EVENT_TYPES.CREATED:
      return isCreateEvent(eventUpdateDescription);
    case POS_ORDER_EVENT_TYPES.PAID:
      return checkPaid(target, eventUpdateDescription);
    case POS_ORDER_EVENT_TYPES.RETURNED:
      return checkReturned(target, eventUpdateDescription);
    case POS_ORDER_EVENT_TYPES.STATUS_CHANGED:
      return checkStatusChanged(target, config, eventUpdateDescription);
    case POS_ORDER_EVENT_TYPES.PAYMENT_CHANGED:
      return checkPaymentChanged(eventUpdateDescription);
    case POS_ORDER_EVENT_TYPES.DELIVERY_COMPLETED:
      return checkDeliveryCompleted(target, eventUpdateDescription);
    default:
      return false;
  }
};
