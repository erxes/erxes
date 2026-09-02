import {
  booleanField,
  dateField,
  lookupField,
  numberField,
  SegmentFieldMeta,
  textField,
} from 'erxes-api-shared/core-modules';

/**
 * Filterable POS order fields.
 *
 * The order document carries a great deal a segment has no business filtering
 * on - ebarimt receipts, Erkhet sync state, print flags, the raw paid-amount
 * arrays. What is listed here is what someone building an audience would name:
 * who bought, how much, when, where, and through which register.
 */

export const POS_ORDER_SEGMENT_FIELDS: SegmentFieldMeta[] = [
  textField({ key: 'number', label: 'Order number' }),
  textField({ key: 'description', label: 'Description' }),

  // Free text rather than a fixed list: which statuses and order types a
  // tenant uses are set by its own POS configuration, not by this schema.
  textField({ key: 'status', label: 'Status' }),
  textField({ key: 'type', label: 'Order type' }),

  numberField({ key: 'totalAmount', label: 'Total amount' }),
  numberField({ key: 'finalAmount', label: 'Final amount' }),
  numberField({ key: 'cashAmount', label: 'Cash amount' }),
  numberField({ key: 'mobileAmount', label: 'Mobile amount' }),

  dateField({ key: 'paidDate', label: 'Paid date' }),
  dateField({ key: 'dueDate', label: 'Due date' }),
  dateField({ key: 'closeDate', label: 'Close date' }),
  dateField({ key: 'createdAt', label: 'Created at' }),

  lookupField({
    key: 'customerId',
    label: 'Customer',
    query: { name: 'customers', labelField: 'primaryEmail' },
  }),
  textField({ key: 'customerType', label: 'Customer type' }),

  lookupField({
    key: 'userId',
    label: 'Cashier',
    query: { name: 'users', labelField: 'email' },
  }),
  lookupField({
    key: 'productId',
    label: 'Product',
    path: 'items.productId',
    query: { name: 'products', labelField: 'name' },
  }),

  // `branches` and `departments` do not take the cursor arguments the generic
  // select needs, so these stay plain id fields - the same as on a deal.
  lookupField({
    key: 'branchId',
    label: 'Branch',
    query: { name: 'branchesMain', labelField: 'title' },
  }),
  lookupField({
    key: 'departmentId',
    label: 'Department',
    query: { name: 'departmentsMain', labelField: 'title' },
  }),
  textField({ key: 'posId', label: 'POS' }),

  booleanField({ key: 'isPre', label: 'Is pre-order' }),
];
