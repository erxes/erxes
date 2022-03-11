import { getSchemaLabels } from "@erxes/api-utils/src/logUtils";
import { generateModels } from "./connectionResolver";

import { LOG_MAPPINGS } from "./constants";
import {
  collectItems,
  getCardContentIds,
  getContentItem,
  getContentTypeDetail,
} from "./utils";

export default {
  getActivityContent: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return getContentItem(models, data);
  },

  getContentTypeDetail: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { activityLog = {} } = data;

    return getContentTypeDetail(models, activityLog);
  },

  collectItems: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return collectItems(models, subdomain, data);
  },

  getContentIds: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return getCardContentIds(models, data);
  },

  getSchemaLabels: async ({ data: { type } }) => {
    return getSchemaLabels(type, LOG_MAPPINGS);
  },
};