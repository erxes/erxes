export const LOG_STATUSES = {
  FAILED: 'failed',
  SUCCESS: 'success',
};

export const AFTER_PROCESS_CONSTANTS = {
  'auth.login': 'afterAuth',
  'auth.logout': 'afterAuth',
  'webhook.GET': 'afterAPIRequest',
  'webhook.POST': 'afterAPIRequest',
  'webhook.PUT': 'afterAPIRequest',
  'webhook.PATCH': 'afterAPIRequest',
  'webhook.DELETE': 'afterAPIRequest',
  'graphql.mutation': 'afterMutation',
  'mongo.create': 'createdDocument',
  'mongo.update': 'updatedDocument',
  'mongo.delete': 'deleteDocument',
};
