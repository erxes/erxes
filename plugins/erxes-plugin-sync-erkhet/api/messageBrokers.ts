import { consumeCustomer } from './utils/consumeCustomer';
import { consumeInventory, consumeInventoryCategory } from './utils/consumeInventory';

export default [
  {
    method: "Queue",
    channel: "rpc_queue:erkhet",
    handler: async (msg, { models, memoryStorage }) => {
      const objectData = JSON.parse(msg.object)[0];
      const doc = objectData.fields;
      const kind = objectData.model;
      const old_code = msg.old_code;
      const action = msg.action;

      switch (kind) {
        case 'inventories.inventory':
          await consumeInventory(models, memoryStorage, doc, old_code, action);
          break;
        case 'inventories.category':
          await consumeInventoryCategory(models, doc, old_code, action);
          break;
        case 'customers.customer':
          await consumeCustomer(models, memoryStorage, doc, old_code, action);
          break;
      }

      return;
    },
  },
];
