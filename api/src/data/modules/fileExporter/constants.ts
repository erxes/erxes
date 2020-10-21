export const BOARD_BASIC_INFOS = [
  'userId',
  'createdAt',
  'order',
  'name',
  'closeDate',
  'reminderMinute',
  'isComplete',
  'description',
  'assignedUsers',
  'watchedUserIds',
  'labelIds',
  'stageId',
  'initialStageId',
  'modifiedAt',
  'modifiedBy',
  'priority',
];

export const USER_BASIC_INFOS = [
  'username',
  'isOwner',
  'email',
  'getNotificationByEmail',
  'isActive',
  'brandIds',
  'groupIds',
  'doNotDisturb',
];

export const BRAND_BASIC_INFOS = ['code', 'name', 'description', 'userId', 'createdAt'];

export const CHANNEL_BASIC_INFOS = [
  'createdAt',
  'name',
  'description',
  'conversationCount',
  'openConversationCount',
  'userId',
  'integrationIds',
  'memberIds',
];

export const PERMISSION_BASIC_INFOS = ['module', 'action', 'userId', 'groupId', 'requiredActions', 'allowed'];

export const CUSTOMER_BASIC_INFOS = [
  'state',
  'firstName',
  'lastName',
  'primaryEmail',
  'emails',
  'primaryPhone',
  'phones',
  'ownerId',
  'position',
  'department',
  'leadStatus',
  'status',
  'hasAuthority',
  'description',
  'doNotDisturb',
  'integrationId',
  'code',
  'mergedIds',
];

export const COMPANY_BASIC_INFOS = [
  'primaryName',
  'names',
  'size',
  'industry',
  'website',
  'plan',
  'primaryEmail',
  'primaryPhone',
  'businessType',
  'description',
  'doNotDisturb',
  'parentCompanyId',
];

export const PRODUCT_BASIC_INFOS = ['name', 'categoryCode', 'type', 'description', 'sku', 'code', 'unitPrice'];
