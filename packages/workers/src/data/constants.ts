export const RABBITMQ_QUEUES = {
  PUT_LOG: 'putLog',
  RPC_API_TO_INTEGRATIONS: 'rpc_queue:api_to_integrations',
  RPC_API_TO_WORKERS: 'rpc_queue:api_to_workers',
  RPC_API_TO_WEBHOOK_WORKERS: 'rpc_queue:api_to_webhook_workers',
  WORKERS: 'workers',
  VISITOR_LOG: 'visitorLog',
  RPC_VISITOR_LOG: 'rpc_queue:visitorLog',
  AUTOMATIONS_TRIGGER: 'automations:trigger',
  LOG_DELETE_OLD: 'log:delete:old'
};

export const USER_PROPERTIES_INFO = {
  email: 'Primary email',
  username: 'User name',
  ALL: [
    { field: 'email', label: 'Primary email', canHide: false },
    { field: 'username', label: 'User name' }
  ]
};

export const MODULE_NAMES = {
  BRAND: 'brand',
  PERMISSION: 'permission',
  USER: 'user',
  USER_GROUP: 'userGroup'
};
