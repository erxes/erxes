import { __ } from '../utils';

export const TAG_TYPES = {
  CONVERSATION: __('inbox:conversation'),
  CUSTOMER: __('contacts:customer'),
  ENGAGE_MESSAGE: __('engages:engageMessage'),
  COMPANY: __('contacts:company'),
  INTEGRATION: __('inbox:integration'),
  PRODUCT: __('products:product'),
  ALL_LIST: [
    'conversation',
    'customer',
    'engageMessage',
    'company',
    'integration',
    'product'
  ]
};
