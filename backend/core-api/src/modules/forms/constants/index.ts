export const LEAD_LOAD_TYPES = {
  SHOUTBOX: 'shoutbox',
  POPUP: 'popup',
  EMBEDDED: 'embedded',
  DROPDOWN: 'dropdown',
  SLIDEINLEFT: 'slideInLeft',
  SLIDEINRIGHT: 'slideInRight',
  ALL: [
    '',
    'shoutbox',
    'popup',
    'embedded',
    'dropdown',
    'slideInLeft',
    'slideInRight',
  ],
};

export const LEAD_SUCCESS_ACTIONS = {
  EMAIL: 'email',
  REDIRECT: 'redirect',
  ONPAGE: 'onPage',
  ALL: ['', 'email', 'redirect', 'onPage'],
};
export const INPUT_TYPE = [
  { label: 'Text', value: 'text' },
  { label: 'Text Area', value: 'textarea' },
];

export const EXTEND_FIELDS = {
  CUSTOMER: [
    { name: 'companiesPrimaryNames', label: 'Company Primary Names' },
    { name: 'companiesPrimaryEmails', label: 'Company Primary Emails' },
  ],
  ALL: [
    { name: 'tag', label: 'Tag' },
    { name: 'ownerEmail', label: 'Owner email' },
  ],
};
