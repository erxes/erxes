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
  console.log("Subdomain:", subdomain);

  if (!isEnabled("automations")) return;

  const NOW = new Date();
  const NOW_MONTH = NOW.getMonth() + 1;

  console.log("NOW", NOW);
  console.log("NOW_MONTH", NOW_MONTH);

  console.log('Object.keys(collections)', Object.keys(collections))

  for (const collectionName of Object.keys(collections)) {
    const query = collections[collectionName](NOW_MONTH) || {};

    console.log("Query:", JSON.stringify(query));

    const targets =
      (await sendCoreMessage({
        subdomain,
        action: `${collectionName}.find`,
        data: query,
        isRPC: true,
        defaultValue: [],
      })) || [];

    console.log(collectionName, targets.length);

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
      isRPC: true,
    }).then((res) => {
      console.log("Success:", res);
    })
    .catch((err) => {
      console.error("Error:", err);
    });
  }
};

export default {
  handleDailyJob: async ({ subdomain }) => {
    const VERSION = getEnv({ name: "VERSION" });
    
    if (VERSION && VERSION === "saas") {
      const orgs = await getOrganizations();
      
      const enabledOrganizations = orgs.filter((org) => !org?.isDisabled);
      
      for (const org of enabledOrganizations) {
        handleLoyaltyCronjob({ subdomain: org?.subdomain });
      }
    } else {
      handleLoyaltyCronjob({ subdomain });
    }
  },
  handle3SecondlyJob: async ({ subdomain }) => {
    const VERSION = getEnv({ name: "VERSION" });
    
    if (VERSION && VERSION === "saas") {
      const orgs = await getOrganizations();

      const ORG_NAME = getEnv({ name: "ORG_NAME" })
      
      const enabledOrganizations = orgs.filter((org) => !org?.isDisabled && org?.name === ORG_NAME);
      
      for (const org of enabledOrganizations) {
        handleLoyaltyCronjob({ subdomain: org?.subdomain });
      }
    } else {
      handleLoyaltyCronjob({ subdomain });
    }
  }
};
