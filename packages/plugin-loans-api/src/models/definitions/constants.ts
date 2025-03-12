export const REPAYMENT_TYPE = [
  { label: 'Equal Principal Payment', value: 'equal' }, // undsen tulbur tentsuu
  { label: 'Fixed Rate Payment', value: 'fixed' }, // niit tulbur tentsuu
  { label: 'Last of date', value: 'last' }, // niit tulbur tentsuu
];

export const REPAYMENT = {
  EQUAL: 'equal', // undsen tulbur tentsuu
  FIXED: 'fixed', // niit tulbur tentsuu
  LAST: 'last', // hugatsaanii etsest neg udaa
};

export const CONTRACT_STATUS = {
  DRAFT: 'draft',
  NORMAL: 'normal',
  CLOSED: 'closed',
  PAUSE: 'pause',
  ALL: ['draft', 'normal', 'closed', 'pause']
};

export const LOSS_CALC_TYPE = {
  FROMAMOUNT: 'fromAmount',
  FROMINTEREST: 'fromInterest',
  FROMTOTALPAYMENT: 'fromTotalPayment',
  FROMENDAMOUNT: 'fromEndAmount',
  ALL: ['fromAmount', 'fromInterest', 'fromTotalPayment', 'fromEndAmount']
};

export const CONTRACT_CLASSIFICATION = {
  NORMAL: 'NORMAL',
  EXPIRED: 'EXPIRED',
  DOUBTFUL: 'DOUBTFUL',
  NEGATIVE: 'NEGATIVE',
  BAD: 'BAD',
  ALL: ['NORMAL', 'EXPIRED', 'DOUBTFUL', 'NEGATIVE', 'BAD']
};

export const COLLATERAL_STATUS = {
  ACTIVE: 'active',
  ARCHIVE: 'archive',
  ALL: ['active', 'archive']
};

export const INVOICE_STATUS = {
  PENDING: 'pending',
  LESS: 'less',
  DONE: 'done',
  CANCELED: 'canceled',

  ALL: ['pending', 'less', 'done', 'canceled']
};

export const SCHEDULE_STATUS = {
  PENDING: 'pending', // ирээдүйнх
  EXPIRED: 'expired', // хугацаа нь талийсан
  DONE: 'done', // ок
  SKIPPED: 'skipped', // алгассан
  LESS: 'less', // дутуу
  PRE: 'pre', // урьдчилж хийгдсэн
  GIVE: 'give', // өгсөн талынх
  COMPLETE: 'complete', // үлдэгдэлгүй болсон

  ALL: ['pending', 'done', 'skipped', 'pre', 'less', 'expired', 'give', 'complete']
};

export const LEASE_TYPES = {
  FINANCE: 'finance',
  LINEAR: 'linear',
  CREDIT: 'credit',
  SAVING: 'saving',

  ALL: ['finance', 'linear', 'credit', 'saving']
};

export const COLLECTIVELY_RULES = {
  FREE: 'free',
  MUST: 'must',
  NOT: 'not',

  ALL: ['free', 'must', 'not']
};

export const INTEREST_CORRECTION_TYPE = {
  STOP_INTEREST: 'stopInterest',
  INTEREST_RETURN: 'interestReturn',
  INTEREST_CHANGE: 'interestChange',
  ALL: ['stopInterest', 'interestReturn', 'interestChange']
};
