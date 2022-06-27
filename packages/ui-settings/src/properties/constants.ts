export const FIELDS_GROUPS_CONTENT_TYPES = {
  CUSTOMER: 'contacts:customer',
  COMPANY: 'contacts:company',
  PRODUCT: 'product',
  CONVERSATION: 'conversation',
  DEVICE: 'device',
  USER: 'core:user',
  ALL: [
    'contacts:customer',
    'contacts:company',
    'product',
    'conversation',
    'device',
    'core:user'
  ]
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
    'isOnline',
    'sessionCount',
    'leadStatus',
    'relatedIntegrationIds',
    'hasAuthority',
    'stageChangedDate',
    'stageId',
    'userId',
    'modifiedBy',
    'assignedUserIds',
    'watchedUserIds'
  ],
  EXPORT: [
    'state',
    'avatar',
    'ownerId',
    'status',
    'integrationId',
    'categoryId',
    'vendorId',
    'location.countryCode',
    'tagIds',
    'isOnline',
    'leadStatus',
    'relatedIntegrationIds'
  ]
};
