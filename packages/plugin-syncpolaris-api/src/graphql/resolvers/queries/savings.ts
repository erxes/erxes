import { IContext } from "../../../connectionResolver";
import { escapeRegExp } from "@erxes/api-utils/src/core";

const generateFilter = (contentType, contentId) => {
  const query: any = {};

  if (contentType) {
    query.contentType = { $regex: `.*${escapeRegExp(contentType)}.*` };
  }
  if (contentId) {
    query.contentId = contentId;
  }

  return query;
};

const savingsQueries = {
  async syncSavingsData(
    _root,
    { contentType, contentId }: { contentType: string; contentId: string },
    { models }: IContext
  ) {
    const selector = generateFilter(contentType, contentId);
    return models.SyncLogs.find(selector).sort({ createdAt: -1 });
  },
};

export default savingsQueries;
