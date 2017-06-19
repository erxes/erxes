export const EMAIL_CONTENT_CLASS = 'erxes-email-content';
export const EMAIL_CONTENT_PLACEHOLDER = `<div class="${EMAIL_CONTENT_CLASS}"></div>`;

export const EMAIL_CONTENT_KEYS_FOR_SELECT = [
  {
    group: { value: 'customer', text: 'Customer' },
    options: [{ value: 'name', text: 'Name' }, { value: 'email', text: 'Email' }],
  },
  {
    group: { value: 'user', text: 'User' },
    options: [
      { value: 'fullName', text: 'Fullname' },
      { value: 'position', text: 'Position' },
      { value: 'email', text: 'Email' },
    ],
  },
];

export const statusFilters = [
  { key: 'live', value: 'Live' },
  { key: 'draft', value: 'Draft' },
  { key: 'paused', value: 'Paused' },
  { key: 'yours', value: 'Your messages' },
];

export const MESSENGER_KINDS = {
  CHAT: 'chat',
  NOTE: 'note',
  POST: 'post',
  ALL_LIST: ['chat', 'note', 'post'],
  SELECT_OPTIONS: [
    { value: 'chat', text: 'Chat' },
    { value: 'note', text: 'Note' },
    { value: 'post', text: 'Post' },
  ],
};

export const METHODS = {
  MESSENGER: 'messenger',
  EMAIL: 'email',
  ALL_LIST: ['messenger', 'email'],
};
