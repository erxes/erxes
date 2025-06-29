import { sendCommonMessage } from "../messageBroker";

export default {
  handleDailyJob: async ({ subdomain }) => {
    sendCommonMessage({
      subdomain,
      serviceName: "loyalties",
      action: "handleBirthDay",
      data: {},
      defaultValue: [],
      isRPC: true,
    });
  },
  handle3SecondlyJob: async ({ subdomain }) => {
    sendCommonMessage({
      subdomain,
      serviceName: "loyalties",
      action: "handleBirthDay",
      data: {},
      defaultValue: [],
    });
  },
};
