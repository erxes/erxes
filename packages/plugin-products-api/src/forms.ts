import { generateFieldsFromSchema } from "@erxes/api-utils/src";
import { IModels, generateModels } from "./connectionResolver";
import { EXTEND_FIELDS, PRODUCT_INFO } from "./constants";

import { sendCoreMessage } from "./messageBroker";

export default {
  types: [{ description: "Products & services", type: "product" }],
  fields: async ({ subdomain, data }) => {}
};
