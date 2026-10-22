export const DIRECT_MESSAGE_OPERATOR_TYPES = [
  { labelKey: 'operator-is-equal-to', value: 'isEqual' },
  { labelKey: 'operator-is-contains', value: 'isContains' },
  { labelKey: 'operator-every-keywords', value: 'every' },
  { labelKey: 'operator-some-keywords', value: 'some' },
  { labelKey: 'operator-start-with', value: 'startWith' },
  { labelKey: 'operator-end-with', value: 'endWith' },
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
