import { ActivityLogs, EmailDeliveries } from '../models';
import { ACTIVITY_ACTIONS, ACTIVITY_PERFORMER_TYPES, ACTIVITY_TYPES } from '../models/definitions/constants';

const emailDeliveryListeners = () =>
  EmailDeliveries.watch().on('change', data => {
    const email = data.fullDocument;

    if (data.operationType === 'insert' && email) {
      ActivityLogs.createDoc({
        activity: {
          id: Math.random().toString(),
          type: ACTIVITY_TYPES.EMAIL,
          action: ACTIVITY_ACTIONS.SEND,
          content: email.body,
        },
        contentType: {
          type: email.cocType,
          id: email.cocId,
        },
        performer: {
          type: ACTIVITY_PERFORMER_TYPES.USER,
          id: email.userId,
        },
      });
    }
  });

export default emailDeliveryListeners;
