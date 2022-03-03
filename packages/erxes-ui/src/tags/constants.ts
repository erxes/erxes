import { __ } from '../utils';

export const TAG_TYPES = {
  CONVERSATION: __('conversation'),
  CUSTOMER: __('contacts:customer'),
  ENGAGE_MESSAGE: __('engageMessage'),
  COMPANY: __('contacts:company'),
  INTEGRATION: __('integration'),
  PRODUCT: __('product'),
  PRODUCT_TEMPLATE: __('productTemplate'),
  ALL_LIST: [
    'conversation',
    'customer',
    'engageMessage',
    'company',
    'integration',
    'product',
    'productTemplate'
  ]
};
