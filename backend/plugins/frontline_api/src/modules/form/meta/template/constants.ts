export const FORM_EXCLUDE_FIELDS = [
  '_id',
  'createdAt',
  'updatedAt',
  'brandId',
  'departmentIds',
  'integrationId',
  'tagIds',
  'createdUserId',
  'createdDate',
  'userId',
  'memberId',
  'lastUpdatedUserId',
];

export const CHANNEL_EXCLUDE_FIELDS = [
  '_id',
  'createdAt',
  'createdBy',
  'memberIds',
  'userId',
  'conversationCount',
  'openConversationCount',
  'integrationIds'
];

export const FIELD_EXCLUDE_FIELDS = [
  '_id',
  'createdAt',
  'updatedAt',
  'formId',
  'createdUserId',
  'createdDate',
  'userId',
  'memberId',
  'lastUpdatedUserId',
];

export const FRONTLINE_TEMPLATE_EXCLUDE_FIELDS = {
  channel: CHANNEL_EXCLUDE_FIELDS,
  form: FORM_EXCLUDE_FIELDS,
  fields: FIELD_EXCLUDE_FIELDS,
};
