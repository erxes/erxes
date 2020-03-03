export const AUTOMATION_STATUS = {
  DRAFT: 'draft',
  PUBLISH: 'publish',
  DELETE: 'delete',

  ALL: ['draft', 'publish', 'delete'],
};

export const AUTOMATION_TYPE = {
  TRIGGER: 'trigger',
  ACTION: 'action',
  CONDITION: 'condition',

  ALL: ['trigger', 'action', 'condition'],
};

export const TRIGGER_KIND = {
  TIME: 'time',
  CHANGE_DEAL: 'changeDeal',
  CHANGE_LIST_PRODUCT: 'changeListProduct',
  CHANGE_LIST_INVENTORY: 'changeListInventory',
  CHANGE_LIST_CUSTOMER_ERKHET: 'changeListCustomerErkhet',
  CHANGE_LIST_CUSTOMER: 'changeListCustomer',
  CHANGE_LIST_COMPANY: 'changeListCompany',
  CHANGE_LIST_WORKER: 'changeListWorker',

  ALL: [
    'time',
    'changeDeal',
    'changeListProduct',
    'changeListInventory',
    'changeListCustomerErkhet',
    'changeListCustomer',
    'changeListCompany',
    'changeListWorker',
  ],
};

export const ACTION_KIND = {
  DELAY: 'delay',
  SEND_NOTIFICATION: 'sendNotification',
  ERKHET_POST_DATA: 'erkhetPostData',
  PRODUCT_TO_ERKHET: 'productToErkhet',
  INVENTORY_TO_ERXES: 'inventoryToErxes',
  CUSTOMER_TO_ERXES: 'customerToErxes',
  COMPANY_TO_ERXES: 'companyToErxes',
  CUSTOMER_TO_ERKHET: 'customerToErkhet',
  WORKER_TO_ERXES: 'workerToErxes',

  ALL: [
    'delay',
    'sendNotification',
    'erkhetPostData',
    'productToErkhet',
    'inventoryToErxes',
    'customerToErxes',
    'companyToErxes',
    'customerToErkhet',
    'workerToErxes',
  ],
};

export const CONDITION_KIND = {
  CHECK_CUSTOMER_IS_EBARIMT_COMPANY: 'checkCustomerIsEbarimtCompany',
  CHECK_COMPANY_VALID_EBARIMT: 'checkCompanyValidEbarimt',

  ALL: ['checkCustomerIsEbarimtCompany', 'checkCompanyValidEbarimt'],
};

export const ALL_KIND = TRIGGER_KIND.ALL.concat(ACTION_KIND.ALL, CONDITION_KIND.ALL);

export const QUEUE_STATUS = {
  PENDING: 'pending',
  WORKING: 'working',
  COMPLETE: 'complete',
  ERROR: 'error',
  ASYNC: 'async',

  ALL: ['pending', 'working', 'complete', 'error', 'async'],
};
