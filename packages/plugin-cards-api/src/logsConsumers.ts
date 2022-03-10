import { collectItems, getCardContentIds, getContentItem, getContentTypeDetail } from "./utils";

export default {
  getActivityContent: async (data) => {
    return {
      status: 'success',
      data: await getContentItem(data)
    };
  },
  getContentTypeDetail: async (data) => {
    const { activityLog = {} } = data;

    return {
      status: 'success',
      data: await getContentTypeDetail(activityLog)
    };
  },
  collectItems: async (data) => {
    return {
      status: 'success',
      data: await collectItems(data)
    }
  },
  getContentIds: async (data) => ({
    status: 'success',
    data: await getCardContentIds(data)
  })
};
