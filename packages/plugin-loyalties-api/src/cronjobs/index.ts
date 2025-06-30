import { sendCommonMessage } from "../messageBroker";

export default {
  handleDailyJob: async ({ subdomain }) => {
    sendCommonMessage({
      subdomain,
      serviceName: "loyalties",
      action: "handleLoyaltyReward",
      data: {},
      defaultValue: [],
    });
  },
};
