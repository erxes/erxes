import { POS_ORDER_TYPE } from './segments/fields';

export const posSegmentConfigs = {
  contentTypes: [
    {
      contentType: POS_ORDER_TYPE,
      moduleName: 'pos',
      type: 'orders',
      description: 'POS order',
      esIndex: 'pos_orders',
    },
  ],
};
