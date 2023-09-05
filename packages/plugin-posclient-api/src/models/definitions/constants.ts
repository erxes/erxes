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
  SPEND: 'spend',
  LOSS: 'loss',
  REJECT: 'reject',
  BEFORE: 'before',
  ALL: ['take', 'eat', 'delivery', 'save', 'spend', 'loss', 'reject', 'before'],
  SALES: ['take', 'eat', 'delivery', 'save', 'before'],
  OUT: ['spend', 'loss', 'reject']
};

// НӨАТ-н баримтын төрөл
export const BILL_TYPES = {
  CITIZEN: '1', // иргэнд өгөх баримт
  ENTITY: '3', // байгууллагад өгөх баримт
  INVOICE: '5', // нэхэмжлэхээр өгөх баримт
  INNER: '9', // дотоод буюу түр
  ALL: ['1', '3', '5', '9']
};

export const ORDER_RETURN_TYPES = {
  HARD: 'hard',
  SALE: 'sale',
  SOFT: 'soft'
};

export const ORDER_STATUSES = {
  NEW: 'new',
  DOING: 'doing',
  REDOING: 'reDoing',
  DONE: 'done',
  COMPLETE: 'complete',
  PENDING: 'pending',
  RETURN: 'return',

  ALL: ['new', 'doing', 'done', 'complete', 'reDoing', 'pending', 'return'],
  FULL: ['paid', 'done', 'complete']
};

export const ORDER_ITEM_STATUSES = {
  NEW: 'new',
  CONFIRM: 'confirm',
  DONE: 'done',

  ALL: ['new', 'done', 'confirm']
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
