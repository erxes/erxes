const COMMON_VALUES = {
  TEN: '10%',
  TWENTY: '20%',
  THIRTY: '30%',
  FOURTY: '40%',
  FIFTY: '50%',
  SIXTY: '60%',
  SEVENTY: '70%',
  EIGHTY: '80%',
  NINETY: '90%'
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
  '90%'
];

export const PROBABILITY = {
  ...COMMON_VALUES,
  deal: {
    WON: 'Won',
    LOST: 'Lost',
    ALL: [...COMMON_PERCENT, 'Won', 'Lost']
  },
  task: {
    DONE: 'Done',
    ALL: [...COMMON_PERCENT, 'Done']
  },
  ticket: {
    RESOLVED: 'Resolved',
    ALL: [...COMMON_PERCENT, 'Resolved']
  }
};

export const getWarningMessage = (type: string): string => {
  return `Are you sure you want to delete? everything related to this ${type} will be deleted, this action cannot be undone`;
};