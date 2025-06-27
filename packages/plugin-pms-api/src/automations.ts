import { sendCoreMessage } from "./messageBroker";
export default {
  constants: {
    actions: [
      {
        type: "pms:messagePro.create",
        icon: "phone",
        label: "Pms Cleaning",
        description:
          "Create and manage workflows triggered by messaging interactions, enabling seamless communication and automation",
        isAvailable: true,
      },
    ],
  },
  receiveActions: async ({ subdomain, data }) => {
    const { action, execution } = data;
    const documentId = action.config.documentId; // Extract the documentId from the action object
    const { triggerType } = execution;
    const [serviceName, contentType] = triggerType.split(":");

    let { target } = execution;
    const { config } = action;

    return "Sent";
  },
};
