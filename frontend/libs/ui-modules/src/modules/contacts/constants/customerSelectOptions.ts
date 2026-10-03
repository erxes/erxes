// Mirrors CUSTOMER_SELECT_OPTIONS in erxes-api-shared/core-modules/users/constants.
export const CUSTOMER_SEX_OPTIONS = [
  { label: 'Not known', value: '0' },
  { label: 'Male', value: '1' },
  { label: 'Female', value: '2' },
  { label: 'Not applicable', value: '9' },
  { label: 'co/co', value: '10' },
  { label: 'en/en', value: '11' },
  { label: 'ey/em', value: '12' },
  { label: 'he/him', value: '13' },
  { label: 'he/them', value: '14' },
  { label: 'she/her', value: '15' },
  { label: 'she/them', value: '16' },
  { label: 'they/them', value: '17' },
  { label: 'xie/hir', value: '18' },
  { label: 'yo/yo', value: '19' },
  { label: 'ze/zir', value: '20' },
  { label: 've/vis', value: '21' },
  { label: 'xe/xem', value: '22' },
];

export const CUSTOMER_LEAD_STATUS_OPTIONS = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'attemptedToContact' },
  { label: 'Working', value: 'inProgress' },
  { label: 'Bad Timing', value: 'badTiming' },
  { label: 'Unqualified', value: 'unqualified' },
];

export const CUSTOMER_HAS_AUTHORITY_OPTIONS = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];
