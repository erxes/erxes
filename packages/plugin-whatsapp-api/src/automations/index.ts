import { debugInfo } from "@erxes/api-utils/src/debuggers";
import { generateModels } from "../connectionResolver";
import { actionCreateMessage, checkMessageTrigger } from "./messages";
import {
  replacePlaceHolders,
  setProperty
} from "@erxes/api-utils/src/automations";
import { sendMessage as sendCommonMessage } from "@erxes/api-utils/src/core";

const getItems = (
  subdomain: string,
  module: string,
  execution: any,
  triggerType: string
) => {
  const { target } = execution;
  if (module === triggerType) {
    return [target];
  }
};

const getRelatedValue = () => {
  return false;
};

export default {
  constants: {
    actions: [
      {
        type: "whatsapp:messages.create",
        icon: "messenger",
        label: "Send WhatsApp Message",
        description: "Send WhatsApp Message",
        isAvailable: true,
        isAvailableOptionalConnect: true
      }
    ],
    triggers: [
      {
        type: "whatsapp:messages",
        img: "automation3.svg",
        icon: "messenger",
        label: "WhatsApp Message",
        description:
          "Start with a blank workflow that enrolls and is triggered off whatsapp messages",
        isCustom: true,
        conditions: [
          {
            type: "direct",
            icon: "messenger",
            label: "Direct Message",
            description: "User sends direct message with keyword"
          }
        ]
      }
    ]
  },
  receiveActions: async ({
    subdomain,
    data: { action, execution, actionType, collectionType, triggerType }
  }) => {
    const models = await generateModels(subdomain);

    if (actionType === "create") {
      switch (collectionType) {
        case "messages":
          return await actionCreateMessage(
            models,
            subdomain,
            action,
            execution
          );

        default:
          return;
      }
    }

    if (actionType === "set-property") {
      const { module, rules } = action.config;
      const relatedItems = await getItems(
        subdomain,
        module,
        execution,
        triggerType
      );

      return setProperty({
        models,
        subdomain,
        getRelatedValue,
        module,
        rules,
        execution,
        sendCommonMessage,
        relatedItems,
        triggerType
      });
    }

    return;
  },
  replacePlaceHolders: async ({
    subdomain,
    data: { target, config, relatedValueProps }
  }) => {
    const models = generateModels(subdomain);

    const content = await replacePlaceHolders({
      models,
      subdomain,
      getRelatedValue,
      actionData: config,
      target,
      relatedValueProps
    });

    return content;
  },
  checkCustomTrigger: async ({ subdomain, data }) => {
    const { collectionType } = data;
    switch (collectionType) {
      case "messages":
        const result = await checkMessageTrigger(subdomain, data);
        return result;
      default:
        return false;
    }
  }
};
