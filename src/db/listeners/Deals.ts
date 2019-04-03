import { ActivityLogs, Deals } from '../models';
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_CONTENT_TYPES,
  ACTIVITY_PERFORMER_TYPES,
  ACTIVITY_TYPES,
} from '../models/definitions/constants';

const dealListeners = () =>
  Deals.watch().on('change', data => {
    const deal = data.fullDocument;

    /**
     * Creates a deal company registration log
     */
    if (data.operationType === 'insert' && deal) {
      let performer;

      if (deal.userId) {
        performer = {
          type: ACTIVITY_PERFORMER_TYPES.USER,
          id: deal.userId,
        };
      }

      ActivityLogs.createDoc({
        activity: {
          type: ACTIVITY_TYPES.DEAL,
          action: ACTIVITY_ACTIONS.CREATE,
          content: deal.name || '',
          id: deal._id,
        },
        contentType: {
          type: ACTIVITY_CONTENT_TYPES.DEAL,
          id: deal._id,
        },
        performer,
      });
    }
  });

export default dealListeners;
