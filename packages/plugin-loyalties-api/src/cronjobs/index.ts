import { getEnv } from "@erxes/api-utils/src";
import { getOrganizations } from "@erxes/api-utils/src/saas/saas";
import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";
import { sendCommonMessage, sendCoreMessage } from "../messageBroker";

const collections = {
  customers: (NOW_MONTH) => ({
    $expr: {
      $and: [
        {
          $eq: [
            {
              $month: `$birthDate`,
            },
            NOW_MONTH,
          ],
        },
      ],
    },
  }),
  users: (NOW_MONTH) => ({
    query: {
      $expr: {
        $and: [
          {
            $eq: [
              {
                $month: `$details.birthDate`,
              },
              NOW_MONTH,
            ],
          },
        ],
      },
    },
  }),
};

const handleLoyaltyCronjob = async ({ subdomain }) => {
  if (!isEnabled("automations")) return;

  const NOW = new Date();
  const NOW_MONTH = NOW.getMonth() + 1;

  for (const collectionName of Object.keys(collections)) {
    const query = collections[collectionName](NOW_MONTH) || {};

    const targets =
      (await sendCoreMessage({
        subdomain,
        action: `${collectionName}.find`,
        data: query,
        isRPC: true,
        defaultValue: [],
      })) || [];

    if (targets.length === 0) return;

    sendCommonMessage({
      subdomain,
      serviceName: "automations",
      action: "trigger",
      data: {
        type: "loyalties:reward",
        targets,
      },
      defaultValue: [],
    });
  }
};

export default {
  handleDailyJob: async ({ subdomain }) => {
    const VERSION = getEnv({ name: "VERSION" });

    if (VERSION && VERSION === "saas") {
      const orgs = await getOrganizations();

      for (const org of orgs) {
        handleLoyaltyCronjob({ subdomain: org?.subdomain });
      }
    } else {
      handleLoyaltyCronjob({ subdomain });
    }
  },
};
