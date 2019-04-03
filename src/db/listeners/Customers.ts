import { ActivityLogs, Customers } from '../models';
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_CONTENT_TYPES,
  ACTIVITY_PERFORMER_TYPES,
  ACTIVITY_TYPES,
} from '../models/definitions/constants';

const customerListeners = () =>
  Customers.watch().on('change', async data => {
    const customer = data.fullDocument;

    if (data.operationType === 'insert' && customer) {
      let performer;

      if (customer.ownerId) {
        performer = {
          type: ACTIVITY_PERFORMER_TYPES.USER,
          id: customer.ownerId,
        };
      }

      let action = ACTIVITY_ACTIONS.CREATE;
      let content = `${customer.firstName || ''} ${customer.lastName || ''}`;

      if (customer.mergedIds && customer.mergedIds.length > 0) {
        action = ACTIVITY_ACTIONS.MERGE;
        content = customer.mergedIds.toString();
      }

      ActivityLogs.createDoc({
        activity: {
          type: ACTIVITY_TYPES.CUSTOMER,
          action,
          content,
          id: customer._id,
        },
        contentType: {
          type: ACTIVITY_CONTENT_TYPES.CUSTOMER,
          id: customer._id,
        },
        performer,
      });
    }

    const customerId = data.documentKey;

    if (data.operationType === 'delete' && customerId) {
      await ActivityLogs.deleteMany({ 'contentType.id': customerId });
    }
  });

export default customerListeners;
