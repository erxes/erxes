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
    icon: 'IconBrandInstagram',
    description: 'User sends first message on Instagram',
  },
  {
    type: 'persistentMenu',
    label: 'Persistent menu',
    icon: 'IconMenu2',
    description: 'User clicks on persistent menu in Instagram messenger',
  },
  {
    type: 'direct',
    icon: 'IconBrandInstagram',
    label: 'Direct Message',
    description: 'User sends direct message with keyword',
  },
];
