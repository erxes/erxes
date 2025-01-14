import { sendCommonMessage, sendCoreMessage } from "./messageBroker";
import { sendSms } from "./utils";
export default {
  constants: {
    actions: [
      {
        type: "clientportal:messagePro.create",
        icon: "phone",
        label: "Message Pro",
        description:
          "Create and manage workflows triggered by messaging interactions, enabling seamless communication and automation",
        isAvailable: true
      }
    ]
  },
  receiveActions: async ({ subdomain, data }) => {
    const { action, execution } = data;
    const documentId = action.config.documentId; // Extract the documentId from the action object
    const { triggerType } = execution;
    const [serviceName, contentType] = triggerType.split(":");

    let { target } = execution;
    const { config } = action;

    const { subject, body } = await sendCommonMessage({
      subdomain,
      serviceName,
      action: "automations.replacePlaceHolders",
      data: {
        target: { ...target, type: contentType },
        config: {
          subject: config?.subject || "",
          body: config?.body || ""
        }
      },
      isRPC: true,
      defaultValue: {}
    });

    const commonDoc = {
      subdomain,
      subject,
      body,
      target,
      customConfig: config?.customConfig
    };
    const { _id: itemId, stageId, modifiedBy: userId } = commonDoc.target;

    const customerIds = await sendCoreMessage({
      subdomain,
      action: "conformities.savedConformity",
      data: {
        mainType: "deal",
        mainTypeId: itemId,
        relTypes: ["customer"]
      },
      isRPC: true
    });

    let customerCode = "";
    let customerPhone = "";

    const getCustomerPhone = (customer) => {
      return customer?.primaryPhone || ""; // Retrieve primaryPhone or return an empty string
    };

    if (customerIds.length > 0) {
      const customers = await sendCoreMessage({
        subdomain,
        action: "customers.findActiveCustomers",
        data: {
          selector: { _id: { $in: customerIds } },
          fields: {
            _id: 1,
            code: 1,
            firstName: 1,
            lastName: 1,
            primaryEmail: 1,
            primaryPhone: 1
          }
        },
        isRPC: true,
        defaultValue: []
      });

      let customer = customers.find((c) => c.code && c.code.match(/^\d{8}$/g));

      if (customer) {
        customerCode = customer.code || "";
        customerPhone = getCustomerPhone(customer); // Get the phone number
      } else {
        if (customers.length) {
          customer = customers[0];
          customerPhone = getCustomerPhone(customer); // Get the phone number
        }
      }
    }
    const document = await sendCommonMessage({
      serviceName: "documents",
      subdomain,
      action: "printDocument",
      data: {
        _id: documentId,
        itemId: itemId,
        stageId: stageId,
        userId: userId
      },
      isRPC: true,
      defaultValue: ""
    });

    if (document && customerPhone) {
      const htmlContent = Array.isArray(document)
        ? document.join("")
        : document;
      const cleanedText = htmlContent
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(
          /<\/?[a-z][\w-]*(?:\s+[a-z-]+(?:=(?:"[^"]*"|'[^']*'|[^>\s]+))?)*\s*\/?>/gi,
          ""
        )
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim();
      await sendSms(subdomain, "messagePro", customerPhone, cleanedText);
    }
    return "Sent";
  }
};
