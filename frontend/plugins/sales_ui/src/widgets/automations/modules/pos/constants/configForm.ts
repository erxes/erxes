export const POS_ORDER_EVENT_OPTIONS = [
  { value: 'created', label: 'Order created' },
  { value: 'paid', label: 'Order paid' },
  { value: 'returned', label: 'Order returned' },
  { value: 'statusChanged', label: 'Status changed' },
  { value: 'paymentChanged', label: 'Payment changed' },
  { value: 'deliveryCompleted', label: 'Delivery completed' },
];

export const POS_ORDER_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'doing', label: 'Doing' },
  { value: 'reDoing', label: 'Re-Doing' },
  { value: 'done', label: 'Done' },
  { value: 'complete', label: 'Complete' },
  { value: 'pending', label: 'Pending' },
  { value: 'return', label: 'Return' },
];

export const POS_ORDER_TYPE_OPTIONS = [
  { value: 'eat', label: 'Eat' },
  { value: 'take', label: 'Take' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'loss', label: 'Loss' },
  { value: 'spend', label: 'Spend' },
  { value: 'reject', label: 'Reject' },
];

export const POS_CUSTOMER_TYPE_OPTIONS = [
  { value: 'customer', label: 'Customer' },
  { value: 'company', label: 'Company' },
];
