import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";
import { sendCommonMessage, sendCoreMessage } from "../messageBroker";

export default {
  handleDailyJob: async ({ subdomain }) => {
    if (!isEnabled("automations")) return;

    const NOW = new Date();
    const NOW_MONTH = NOW.getMonth() + 1;

    const customers =
      (await sendCoreMessage({
        subdomain,
        action: "customers.find",
        data: {
          $expr: {
            $and: [{ $eq: [{ $month: "$birthDate" }, NOW_MONTH] }],
          },
        },
        isRPC: true,
        defaultValue: [],
      })) || [];

    if (customers.length === 0) return;

    await sendCommonMessage({
      subdomain,
      serviceName: "automations",
      action: "trigger",
      data: {
        type: "loyalties:reward",
        targets: customers,
      },
      defaultValue: [],
    });
  },
};
