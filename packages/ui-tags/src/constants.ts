import { __ } from 'coreui/utils';

export const TAG_TYPES = {
  CONVERSATION: __('inbox:conversation'),
  CUSTOMER: __('contacts:customer'),
  ENGAGE_MESSAGE: __('engages:engageMessage'),
  COMPANY: __('contacts:company'),
  INTEGRATION: __('inbox:integration'),
  PRODUCT: __('products:product'),
  PRODUCT_TEMPLATE: __('productTemplate'),
  DEAL: __('cards:deal'),
  TICKET: __('cards:ticket'),
  TASK: __('cards:task'),
  PURCHASE: __('cards:purchase'),
  DASHBOARD: __('dashboard:dashboard'),
  ALL_LIST: [
    'conversation',
    'customer',
    'engageMessage',
    'company',
    'integration',
    'product',
    'productTemplate',
    'deal',
    'purchase'
  ]
};
