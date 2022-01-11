export const FIELDS_GROUPS_CONTENT_TYPES = {
  CUSTOMER: 'customer',
  COMPANY: 'company',
  PRODUCT: 'product',
  CONVERSATION: 'conversation',
  DEVICE: 'device',
  USER: 'user',
  ALL: ['customer', 'company', 'product', 'conversation', 'device', 'user']
};

export const COLUMN_CHOOSER_EXCLUDED_FIELD_NAMES = {
  LIST: [
    'state',
    'avatar',
    'ownerId',
    'status',
    'integrationId',
    'categoryId',
    'vendorId',
    'emailValidationStatus',
    'phoneValidationStatus',
    'location.countryCode',
    'tagIds'
  ],

  IMPORT: [
    'state',
    'avatar',
    'ownerId',
    'status',
    'integrationId',
    'categoryId',
    'vendorId',
    'emailValidationStatus',
    'phoneValidationStatus',
    'location.countryCode',
    'tagIds',
    'createdAt',
    'modifiedAt',
    'isOnline',
    'lastSeenAt',
    'sessionCount',
    'profileScore',
    'leadStatus',
    'relatedIntegrationIds',
    'hasAuthority',
    'isSubscribed'
  ]
};
