import { __ } from 'coreui/utils';

export const TAG_TYPES = {
  CONVERSATION: __('inbox:conversation'),
  CUSTOMER: __('contacts:customer'),
  ENGAGE_MESSAGE: __('engages:engageMessage'),
  AUTOMATION: __('automations:automations'),
  COMPANY: __('contacts:company'),
  INTEGRATION: __('inbox:integration'),
  PRODUCT: __('products:product'),
  PRODUCT_TEMPLATE: __('productTemplate'),
  DEAL: __('deals:deal'),
  TICKET: __('tickets:ticket'),
  TASK: __('tasks:task'),
  PURCHASE: __('purchases:purchase'),
  DASHBOARD: __('dashboard:dashboard'),
  REPORT: __('reports:reports'),
  ALL_LIST: [
    'conversation',
    'customer',
    'engageMessage',
    'company',
    'integration',
    'product',
    'productTemplate',
    'deal',
    'purchase',
  ],
};
