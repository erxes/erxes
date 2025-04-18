const COMMON_VALUES = {
  TEN: '10%',
  TWENTY: '20%',
  THIRTY: '30%',
  FOURTY: '40%',
  FIFTY: '50%',
  SIXTY: '60%',
  SEVENTY: '70%',
  EIGHTY: '80%',
  NINETY: '90%',
};

const COMMON_PERCENT = [
  '10%',
  '20%',
  '30%',
  '40%',
  '50%',
  '60%',
  '70%',
  '80%',
  '90%',
];

export const PROBABILITY = {
  ...COMMON_VALUES,
  deal: {
    WON: 'Won',
    LOST: 'Lost',
    ALL: [...COMMON_PERCENT, 'Won', 'Lost'],
  },

  task: {
    DONE: 'Done',
    ALL: [...COMMON_PERCENT, 'Done'],
  },
  ticket: {
    RESOLVED: 'Resolved',
    ALL: [...COMMON_PERCENT, 'Resolved'],
  },
};

export const BOARD_NUMBERS = [
  {
    label: 'Year',
    value: 'year',
  },
  {
    label: 'Month',
    value: 'month',
  },
  {
    label: 'Day',
    value: 'day',
  },
  {
    label: 'Dash',
    value: '-',
  },
  {
    label: 'Underscore',
    value: '_',
  },
  {
    label: 'Slash',
    value: '/',
  },
];
export const BOARD_NAMES_CONFIGS = [
  {
    label: "Customer's lastName",
    value: 'customer.lastName',
  },
  {
    label: "Customer's firstName",
    value: 'customer.firstName',
  },
  {
    label: "Customer's email",
    value: 'customer.email',
  },
  {
    label: "Customer's phone",
    value: 'customer.phone',
  },
  {
    label: "Company's name",
    value: 'company.name',
  },
];

export const PAYMENT_TYPE_ICONS = [
  'sign-alt',
  'trees',
  'food',
  'fast-mail',
  'euro',
  'dollar-alt',
  'dollar-sign',
  'calcualtor',
  'at',
  'briefcase-alt',
  'atm-card',
  'hold',
  'shoppingcart',
  'scale',
  'piggybank',
  'pencil',
  'clicker',
  'alarm',
  'diamond',
  'medal',
  'bell',
  'capsule',
  'cart',
  'coffee',
  'attach',
  'pound',
  'usd-circle',
  'yen',
  'ticket',
  'sync',
];
