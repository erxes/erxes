import { Deals, Tasks, GrowthHacks, Tickets, Checklists, ChecklistItems } from '../../apiCollections';
import { debug } from '../../configs';
import { getDocument } from '../../cacheUtils';

export const getContentTypeDetail = async (activityLog: any) => {
  const { contentType, contentId, content } = activityLog;

  let item = {};

  try {
    switch (contentType) {
      case "deal":
        item = await Deals.getDeal(contentId);
        break;
      case "task":
        item = await Tasks.getTask(contentId);
        break;
      case "growthHack":
        item = await GrowthHacks.getGrowthHack(contentId);
        break;
      case "ticket":
        item = await Tickets.getTicket(contentId);
        break;
      case "checklist":
        item = (await Checklists.findOne({ _id: content._id })) || {};
        break;
      case "checklistitem":
        item = (await ChecklistItems.findOne({ _id: content._id })) || {};
        break;
    }
  } catch (e) {
    debug.error(e.message);
  }

  return item;
};

export default {
  createdUser(activityLog: any) {
    return getDocument("users", { _id: activityLog.createdBy });
  },

  contentTypeDetail(activityLog: any) {
    return getContentTypeDetail(activityLog);
  },
};
