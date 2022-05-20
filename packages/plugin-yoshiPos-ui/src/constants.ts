export const ORDER_TYPES = {
  TAKE: 'take',
  EAT: 'eat',
  SAVE: 'save',
  ALL: ['take', 'eat', 'save']
};

export const ORDER_STATUSES = {
  NEW: 'new',
  PAID: 'paid',
  DOING: 'doing',
  DONE: 'done',
  ROAD: 'road',
  COMPLETE: 'complete',

  ALL: ['new', 'paid', 'doing', 'done', 'road', 'complete'],
  FULL: ['paid', 'done', 'complete']
};

export const POS_MODES = {
  POS: '',
  KIOSK: 'kiosk',
  KITCHEN: 'kitchen',
  WAITING: 'waiting',
  ALL: ['', 'kiosk', 'kitchen', 'waiting']
};

// НӨАТ-н баримтын төрөл
export const BILL_TYPES = {
  CITIZEN: '1', // иргэнд өгөх баримт
  ENTITY: '3' // байгууллагад өгөх баримт
};

export const PAYMENT_TYPES = {
  CARD: 'cardAmount',
  CASH: 'cashAmount',
  REGISTER: 'registerNumber'
};
