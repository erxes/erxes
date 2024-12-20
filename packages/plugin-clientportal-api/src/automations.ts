// packages / plugin - clientportal - api / src / automations.ts;

import { debugError } from "@erxes/api-utils/src/debuggers";
import {
  sendCommonMessage,
  sendCoreMessage,
  sendDocumentsGet,
} from "./messageBroker";
import { sendSms } from "./utils";
import { doc } from 'prettier';
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
    const { _id: itemId, stageId, modifiedBy: userId, description } = commonDoc.target;
    const orderDataMatches = description.match(/\{([^{}]*)\}/g);
    let sendPhoneNumber: string | undefined;
    const phoneMatch = description.match(/Утасны дугаар:\s*(\d+)/);
    if (phoneMatch) {
        const phone = phoneMatch[1];
        sendPhoneNumber = phone;
    } else if (orderDataMatches) {
        const cleanedJson = orderDataMatches[0]
            .replace(/<br>/g, '')
            .replace(/&nbsp;/g, ' ')
            .trim();
        try {
            const orderData = JSON.parse(cleanedJson);
            sendPhoneNumber = orderData.phone;
        } catch (error) {
            throw new Error('Failed to parse order data. Please check the JSON format.');
        }
    } else {
        throw new Error('Neither phone number nor order data found in the description.');
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
    
    if (document && sendPhoneNumber) {
      const htmlContent = Array.isArray(document) ? document.join("") : document;
      const cleanedText = htmlContent
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") 
      .replace(/<\/?[^>]+>/g, "") 
      .replace(/&amp;/g, "&") 
      .replace(/\s+/g, " ")
      .trim(); 
      await sendSms(subdomain, "messagePro", sendPhoneNumber, cleanedText);
    }
    return "Sent";
  }
};