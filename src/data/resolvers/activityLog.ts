import {
  Brands,
  Companies,
  Customers,
  Deals,
  GrowthHacks,
  Integrations,
  Stages,
  Tasks,
  Tickets,
  Users,
} from '../../db/models';
import { IActivityLog } from '../../db/models/definitions/activityLogs';
import { ACTIVITY_ACTIONS } from '../../db/models/definitions/constants';

export default {
  async createdByDetail(activityLog: IActivityLog) {
    const user = await Users.findOne({ _id: activityLog.createdBy });

    if (user) {
      return { type: 'user', content: user };
    }

    const integration = await Integrations.findOne({ _id: activityLog.createdBy });

    if (integration) {
      const brand = await Brands.findOne({ _id: integration.brandId });
      return { type: 'brand', content: brand };
    }

    return;
  },

  async contentTypeDetail(activityLog: IActivityLog) {
    const { contentType, contentId } = activityLog;

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

    return item;
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

      const destinationStage = await Stages.findOne({ _id: destinationStageId });
      const oldStage = await Stages.findOne({ _id: oldStageId });

      if (destinationStage && oldStage) {
        return {
          destinationStage: destinationStage.name,
          oldStage: oldStage.name,
          item,
        };
      }

      return {
        text: content.text,
      };
    }

    if (action === ACTIVITY_ACTIONS.MERGE) {
      let result = {};

      switch (contentType) {
        case 'company':
          result = await Companies.find({ _id: { $in: activityLog.content } });
          break;
        case 'customer':
          result = await Customers.find({ _id: { $in: activityLog.content } });
          break;
      }

      return result;
    }
  },
};
