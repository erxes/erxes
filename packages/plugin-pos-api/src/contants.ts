export const POS_ORDER_INFO = {
  createdAt: 'Created At',
  modifiedAt: 'Modified At',
  status: 'Status of the order',
  paidDate: 'Paid date',
  dueDate: 'Due date',
  number: 'Order number',
  customerId: 'Customer',
  customerType: 'Customer type',
  cashAmount: 'Cash amount',
  mobileAmount: 'Mobile amount',
  paidAmounts: 'Paid amounts',
  totalAmount: 'Total amount',
  finalAmount: 'Final amount',
  shouldPrintEbarimt: 'Should print ebarimt',
  printedEbarimt: 'Printed ebarimt',
  billType: 'Bill type',
  billId: 'Bill id',
  registerNumber: 'Register number',
  oldbillId: 'Old bill id',
  type: 'Order type',
  branch: 'Branch',
  department: 'Department',
  subBranch: 'Sub Branch',
  userId: 'Created user',
  synced: 'Synced',
  posToken: 'Pos token',
  subToken: 'Sub token',
  deliveryInfo: 'Delivery info',
  description: 'Description',
  isPre: 'isPre',
  origin: 'Origin',
  slotCode: 'Slot code',
  taxinfo: 'Tax info',
  convertDealId: 'Convert deal id',
  ALL: [
    { field: 'createdAt', label: 'Created At' },
    { field: 'modifiedAt', label: 'Modified At' },
    { field: 'status', label: 'Status of the order' },
    { field: 'paidDate', label: 'Paid date' },
    { field: 'dueDate', label: 'Due date' },
    { field: 'number', label: 'Order number' },
    { field: 'customerId', label: 'Customer' },
    { field: 'customerType', label: 'Customer type' },
    { field: 'cashAmount', label: 'Cash amount' },
    { field: 'mobileAmount', label: 'Mobile amount' },
    { field: 'paidAmounts', label: 'Paid amounts' },
    { field: 'totalAmount', label: 'Total amount' },
    { field: 'finalAmount', label: 'Final amount' },
    { field: 'shouldPrintEbarimt', label: 'Should print ebarimt' },
    { field: 'printedEbarimt', label: 'Printed ebarimt' },
    { field: 'billType', label: 'Bill type' },
    { field: 'billId', label: 'Bill id' },
    { field: 'registerNumber', label: 'Register number' },
    { field: 'oldbillId', label: 'Old bill id' },
    { field: 'type', label: 'Order type' },
    { field: 'branchId', label: 'Branch id' },
    { field: 'departmentId', label: 'Department id' },
    { field: 'subBranchId', label: 'Sub branch id' },
    { field: 'userId', label: 'Created User' },
    { field: 'synced', label: 'Synced' },
    { field: 'posToken', label: 'Pos token' },
    { field: 'subToken', label: 'Sub token' },
    { field: 'deliveryInfo', label: 'Delivery info' },
    { field: 'description', label: 'Description' },
    { field: 'isPre', label: 'is-Pre' },
    { field: 'origin', label: 'Origin' },
    { field: 'slotCode', label: 'Slot code' },
    { field: 'taxinfo', label: 'Tax info' },
    { field: 'convertDealId', label: 'Convert deal id' }
  ]
};

export const USER_FIELDS = {
  _id: 1,
  createdAt: 1,
  username: 1,
  password: 1,
  isOwner: 1,
  email: 1,
  isActive: 1,
  details: 1
};

export const EXTEND_FIELDS = [
  {
    _id: Math.random(),
    name: 'items.productCategoryCode',
    label: 'product Category Code',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'items.productCategoryName',
    label: 'product Category Name',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'items.amount',
    label: 'Amount',
    type: 'number'
  },
  {
    _id: Math.random(),
    name: 'items.productCode',
    label: 'Product code',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'items.productName',
    label: 'Product name',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'items.barcode',
    label: 'Barcode',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'paymentType',
    label: 'Payment type',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'pos',
    label: 'POS',
    type: 'string'
  }
];
