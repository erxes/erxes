export const DIRECT_MESSAGE_OPERATOR_TYPES = [
  { label: 'Is Equal to', value: 'isEqual' },
  { label: 'Is Contains', value: 'isContains' },
  { label: 'Is Every keywords includes', value: 'every' },
  { label: 'Is Some keywords includes', value: 'some' },
  { label: 'Start with', value: 'startWith' },
  { label: 'End with', value: 'endWith' },
];

export const MESSAGE_TRIGGER_CONDITIONS = [
  {
    type: 'getStarted',
    label: 'Get Started',
    icon: 'IconBrandMessenger',

    description: 'User click on get started on the messenger',
  },
  {
    type: 'persistentMenu',
    label: 'Persistent menu',
    icon: 'IconMenu2',
    description: 'User click on persistent menu on the messenger',
  },
  {
    type: 'direct',
    icon: 'IconBrandMessenger',
    label: 'Direct Message',
    description: 'User sends direct message with keyword',
  },
];
