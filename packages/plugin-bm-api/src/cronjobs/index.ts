import { getEnv } from "@erxes/api-utils/src";
import { getOrganizations } from "@erxes/api-utils/src/saas/saas";
import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";
import { sendCoreMessage } from "../messageBroker";
import { generateModels } from "../connectionResolver";

const handleBmCronjob = async ({ subdomain }) => {
  const models = await generateModels(subdomain);

  const update = await models.Tours.updateMany(
    {
      endDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      status: "Ongoing",
    },
    { $set: { status: "Completed" } }
  );
};

export default {
  handleHourlyJob: async ({ subdomain }) => {
    const VERSION = getEnv({ name: "VERSION" });

    if (VERSION && VERSION === "saas") {
      const orgs = await getOrganizations();

      const enabledOrganizations = orgs.filter(org => !org?.isDisabled);

      for (const org of enabledOrganizations) {
        handleBmCronjob({ subdomain: org?.subdomain });
      }
    } else {
      handleBmCronjob({ subdomain });
    }
  },
};
