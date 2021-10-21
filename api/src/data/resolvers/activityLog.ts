import {
  Companies,
  Customers,
  Deals,
  GrowthHacks,
  Stages,
  Tasks,
  Tickets
} from '../../db/models';
import { IActivityLog } from '../../db/models/definitions/activityLogs';
import { ACTIVITY_ACTIONS } from '../../db/models/definitions/constants';
import { ITagDocument } from '../../db/models/definitions/tags';
import { IUserDocument } from '../../db/models/definitions/users';
import { getContentTypeDetail } from './activityLogByAction';
import { getDocument, getDocumentList } from './mutations/cacheUtils';

export default {
  async createdByDetail(activityLog: IActivityLog) {
    const user = await getDocument('users', { _id: activityLog.createdBy });

    if (user) {
      return { type: 'user', content: user };
    }

    const integration = await getDocument('integrations', {
      _id: activityLog.createdBy
    });

    if (integration) {
      const brand = await getDocument('brands', { _id: integration.brandId });
      return { type: 'brand', content: brand };
    }

    return;
  },

  contentTypeDetail(activityLog: IActivityLog) {
    return getContentTypeDetail(activityLog);
  },

  async contentDetail(activityLog: IActivityLog) {
    const { action, content, contentType, contentId } = activityLog;

    if (action === ACTIVITY_ACTIONS.MOVED) {
      let item = {};

      switch (contentType) {
        case 'deal':
          item = await Deals.getDeal(contentId);
          break;
        case 'task':
          item = await Tasks.getTask(contentId);
          break;
        case 'growthHack':
          item = await GrowthHacks.getGrowthHack(contentId);
          break;
        case 'ticket':
          item = await Tickets.getTicket(contentId);
          break;
      }

      const { oldStageId, destinationStageId } = content;

      const destinationStage = await Stages.findOne({
        _id: destinationStageId
      }).lean();
      const oldStage = await Stages.findOne({ _id: oldStageId }).lean();

      if (destinationStage && oldStage) {
        return {
          destinationStage: destinationStage.name,
          oldStage: oldStage.name,
          item
        };
      }

      return {
        text: content.text
      };
    }

    if (action === ACTIVITY_ACTIONS.MERGE) {
      let result = {};

      switch (contentType) {
        case 'company':
          result = await Companies.find({
            _id: { $in: activityLog.content }
          }).lean();
          break;
        case 'customer':
          result = await Customers.find({
            _id: { $in: activityLog.content }
          }).lean();
          break;
      }

      return result;
    }

    if (action === ACTIVITY_ACTIONS.ASSIGNEE) {
      let addedUsers: IUserDocument[] = [];
      let removedUsers: IUserDocument[] = [];

      if (content) {
        addedUsers = await getDocumentList('users', {
          _id: { $in: content.addedUserIds }
        });
        removedUsers = await getDocumentList('users', {
          _id: { $in: content.removedUserIds }
        });
      }

      return { addedUsers, removedUsers };
    }

    if (action === ACTIVITY_ACTIONS.TAGGED) {
      let tags: ITagDocument[] = [];
      if (content) {
        tags = await getDocumentList('tags', { _id: { $in: content.tagIds } });
      }

      return { tags };
    }
  }
};
