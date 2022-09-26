export const PRODUCT_TYPES = {
  PRODUCT: 'product',
  SERVICE: 'service',
  ALL: ['product', 'service']
};

export const PRODUCT_STATUSES = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  ALL: ['active', 'deleted']
};

export const PRODUCT_CATEGORY_STATUSES = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  ARCHIVED: 'archived',
  ALL: ['active', 'disabled', 'archived']
};

export const ORDER_TYPES = {
  TAKE: 'take',
  EAT: 'eat',
  SAVE: 'save',
  DELIVERY: 'delivery',
  ALL: ['take', 'eat', 'save', 'delivery']
};

export const DEFAULT_SEX_CHOICES = [
  { label: 'Not known', value: 0 },
  { label: 'Male', value: 1 },
  { label: 'Female', value: 2 },
  { label: 'Not applicable', value: 9 }
];

const STATUSES = [
  { label: 'Active', value: 'Active' },
  { label: 'Deleted', value: 'Deleted' },
  { label: 'deleted', value: 'deleted' }
];

export const CUSTOMER_SELECT_OPTIONS = {
  SEX: [
    ...DEFAULT_SEX_CHOICES,
    { label: 'co/co', value: 10 },
    { label: 'en/en', value: 11 },
    { label: 'ey/em', value: 12 },
    { label: 'he/him', value: 13 },
    { label: 'he/them', value: 14 },
    { label: 'she/her', value: 15 },
    { label: 'she/them', value: 16 },
    { label: 'they/them', value: 17 },
    { label: 'xie/hir', value: 18 },
    { label: 'yo/yo', value: 19 },
    { label: 'ze/zir', value: 20 },
    { label: 've/vis', value: 21 },
    { label: 'xe/xem', value: 22 }
  ],
  EMAIL_VALIDATION_STATUSES: [
    { label: 'Valid', value: 'valid' },
    { label: 'Invalid', value: 'invalid' },
    { label: 'Accept all unverifiable', value: 'accept_all_unverifiable' },
    { label: 'Unverifiable', value: 'unverifiable' },
    { label: 'Unknown', value: 'unknown' },
    { label: 'Disposable', value: 'disposable' },
    { label: 'Catch all', value: 'catchall' },
    { label: 'Bad syntax', value: 'badsyntax' },
    { label: 'Not checked', value: 'Not checked' }
  ],
  PHONE_VALIDATION_STATUSES: [
    { label: 'Valid', value: 'valid' },
    { label: 'Invalid', value: 'invalid' },
    { label: 'Unknown', value: 'unknown' },
    { label: 'Can receive sms', value: 'receives_sms' },
    { label: 'Unverifiable', value: 'unverifiable' },
    { label: 'Accept all unverifiable', value: 'accept_all_unverifiable' }
  ],
  LEAD_STATUS_TYPES: [
    { label: 'New', value: 'new' },
    { label: 'Contacted', value: 'attemptedToContact' },
    { label: 'Working', value: 'inProgress' },
    { label: 'Bad Timing', value: 'badTiming' },
    { label: 'Unqualified', value: 'unqualified' },
    { label: 'Unknown', value: '' },
    { label: 'Connected', value: 'connected' },
    { label: 'Open', value: 'open' },
    { label: 'Open deal', value: 'openDeal' },
    { label: 'Working', value: 'working' }
  ],
  STATUSES,
  DO_NOT_DISTURB: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
    { label: 'Unknown', value: '' }
  ],
  HAS_AUTHORITY: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
    { label: 'Unknown', value: '' }
  ],
  STATE: [
    { label: 'Visitor', value: 'visitor' },
    { label: 'Lead', value: 'lead' },
    { label: 'Customer', value: 'customer' }
  ]
};

// НӨАТ-н баримтын төрөл
export const BILL_TYPES = {
  CITIZEN: '1', // иргэнд өгөх баримт
  ENTITY: '3', // байгууллагад өгөх баримт
  INVOICE: '5', // нэхэмжлэхээр өгөх баримт
  ALL: ['1', '3', '5']
};

export const ORDER_RETURN_TYPES = {
  HARD: 'hard',
  SALE: 'sale',
  SOFT: 'soft'
};

export const ORDER_STATUSES = {
  NEW: 'new',
  PAID: 'paid',
  DOING: 'doing',
  DONE: 'done',
  CONFIRM: 'confirm',
  ROAD: 'road',
  COMPLETE: 'complete',

  ALL: ['new', 'paid', 'doing', 'done', 'road', 'complete', 'confirm'],
  FULL: ['paid', 'done', 'complete']
};

export const ORDER_ITEM_STATUSES = {
  NEW: 'new',
  PAID: 'paid',
  CONFIRM: 'confirm',
  DONE: 'done',
  COMPLETE: 'complete',

  ALL: ['new', 'paid', 'done', 'complete', 'confirm'],
  FULL: ['paid', 'done', 'complete']
};

export const DISTRICTS = {
  '01': 'Архангай',
  '02': 'Баян-Өлгий',
  '03': 'Баянхонгор',
  '04': 'Булган',
  '05': 'Говь-Алтай',
  '06': 'Дорноговь',
  '07': 'Дорнод',
  '08': 'Дундговь',
  '09': 'Завхан',
  '10': 'Өвөрхангай',
  '11': 'Өмнөговь',
  '12': 'Сүхбаатар аймаг',
  '13': 'Сэлэнгэ',
  '14': 'Төв',
  '15': 'Увс',
  '16': 'Ховд',
  '17': 'Хөвсгөл',
  '18': 'Хэнтий',
  '19': 'Дархан-Уул',
  '20': 'Орхон',
  '32': 'Говьсүмбэр',
  '23': 'Хан-Уул',
  '24': 'Баянзүрх',
  '25': 'Сүхбаатар',
  '26': 'Баянгол',
  '27': 'Багануур',
  '28': 'Багахангай',
  '29': 'Налайх',
  '34': 'Сонгинохайрхан',
  '35': 'Чингэлтэй'
};

export const DISTRICTS_REVERSE = {
  Архангай: '01',
  'Баян-Өлгий': '02',
  Баянхонгор: '03',
  Булган: '04',
  'Говь-Алтай': '05',
  Дорноговь: '06',
  Дорнод: '07',
  Дундговь: '08',
  Завхан: '09',
  Өвөрхангай: '10',
  Өмнөговь: '11',
  'Сүхбаатар аймаг': '12',
  Сэлэнгэ: '13',
  Төв: '14',
  Увс: '15',
  Ховд: '16',
  Хөвсгөл: '17',
  Хэнтий: '18',
  'Дархан-Уул': '19',
  Орхон: '20',
  Говьсүмбэр: '32',
  'Хан-Уул': '23',
  Баянзүрх: '24',
  Сүхбаатар: '25',
  Баянгол: '26',
  Багануур: '27',
  Багахангай: '28',
  Налайх: '29',
  Сонгинохайрхан: '34',
  Чингэлтэй: '35'
};

export const ORDER_ORIGINS = {
  POS: '',
  KIOSK: 'kiosk',
  ALL: ['', 'kiosk']
};
