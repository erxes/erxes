import { getEnv } from "@erxes/api-utils/src";
import { getOrganizations } from "@erxes/api-utils/src/saas/saas";
import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";
import { sendCoreMessage } from "../messageBroker";
import { generateModels } from "../connectionResolver";

const handleBmCronjob = async ({ subdomain }) => {
  const models = await generateModels(subdomain);

  const update1 = await models.Tours.updateMany(
    {
      endDate: { $lte: new Date() },
      date_status: "running",
    },
    { $set: { date_status: "compeleted" } }
  );
  const update2 = await models.Tours.updateMany(
    {
      startDate: { $lte: new Date() },
      date_status: "scheduled",
    },
    { $set: { date_status: "running" } }
  );
};
// handleHourlyJob
// handle3SecondlyJob;
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
