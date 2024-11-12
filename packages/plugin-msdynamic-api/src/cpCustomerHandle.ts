import { generateModels } from "./connectionResolver";
import { getConfig } from "./utils";
import { customerToDynamic } from "./utilsCustomer";

export default {
  cpCustomerHandle: async ({ subdomain, data }) => {
    if (!data) {
      return;
    }

    let configs;

    try {
      configs = await getConfig(subdomain, "DYNAMIC", {});
      if (!configs || !Object.keys(configs).length) {
        return;
      }
    } catch (e) {
      return;
    }

    const models = await generateModels(subdomain);

    try {
      if (data.customer) {
        await customerToDynamic(subdomain, data.customer, models, configs);
        return;
      }

      if (data.company) {
        await customerToDynamic(subdomain, data.company, models, configs);
        return;
      }
    } catch (e) {
      console.log(e.message);
    }
  }
};
