import { getEnv } from "@erxes/api-utils/src";
import { sendMessage } from "@erxes/api-utils/src/messageBroker";
import { getOrganizations } from "@erxes/api-utils/src/saas/saas";

export default {
  handleMinutelyJob: async ({ subdomain }) => {
    const VERSION = getEnv({ name: "VERSION" });

    if (VERSION && VERSION === "saas") {
      const orgs = await getOrganizations();

      for (const org of orgs) {
        sendMessage("automations:trigger", {
          subdomain: org?.subdomain,
          data: {
            actionType: "waiting"
          }
        });
      }
    } else {
      sendMessage("automations:trigger", {
        subdomain,
        data: {
          actionType: "waiting"
        }
      });
    }
  }
};
