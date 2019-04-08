import { ActivityLogs, Companies } from '../models';
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_CONTENT_TYPES,
  ACTIVITY_PERFORMER_TYPES,
  ACTIVITY_TYPES,
} from '../models/definitions/constants';

const companyListeners = () =>
  Companies.watch().on('change', async data => {
    const company = data.fullDocument;

    if (data.operationType === 'insert' && company) {
      let performer;

      if (company.ownerId) {
        performer = {
          type: ACTIVITY_PERFORMER_TYPES.USER,
          id: company.ownerId,
        };
      }

      let action = ACTIVITY_ACTIONS.CREATE;
      let content = company.primaryName || '';

      if (company.mergedIds && company.mergedIds.length > 0) {
        action = ACTIVITY_ACTIONS.MERGE;
        content = company.mergedIds.toString();
      }

      ActivityLogs.createDoc({
        activity: {
          type: ACTIVITY_TYPES.COMPANY,
          action,
          content,
          id: company._id,
        },
        contentType: {
          type: ACTIVITY_CONTENT_TYPES.COMPANY,
          id: company._id,
        },
        performer,
      });
    }

    const companyId = data.documentKey;

    if (data.operationType === 'delete' && companyId) {
      await ActivityLogs.deleteMany({ 'contentType.id': companyId });
    }
  });

export default companyListeners;
