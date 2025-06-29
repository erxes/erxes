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
  handle3SecondlyJob: async ({ subdomain }) => {
    sendCommonMessage({
      subdomain,
      serviceName: "loyalties",
      action: "handleLoyaltyReward",
      data: {},
      defaultValue: [],
    });
  },
};
