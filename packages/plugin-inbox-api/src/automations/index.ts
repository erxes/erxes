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
        type: "inbox:messages.create",
        icon: "messenger",
        label: "Send Erxes Messenger Message",
        description: "Send Erxes Messenger Message",
        isAvailable: true,
        isAvailableOptionalConnect: true
      }
    ],

    triggers: [
      {
        type: "inbox:conversation",
        img: "automation4.svg",
        icon: "chat-bubble-user",
        label: "Conversation",
        description:
          "Start with a blank workflow that enrolls and is triggered off conversation"
      },
      {
        type: "inbox:messages",
        img: "automation3.svg",
        icon: "messenger",
        label: "Erxes Messenger ",
        description:
          "Start with a blank workflow that enrolls and is triggered off messenger messages",
        isCustom: true,
        conditions: [
          {
            type: "getStarted",
            label: "Get Started",
            icon: "messenger",
            description: "User click on get started on the messenger"
          },
          {
            type: "persistentMenu",
            label: "Persistent menu",
            icon: "menu-2",
            description: "User click on persistent menu on the messenger"
          },
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
    data: { action, execution, actionType, collectionType, triggerType, _root }
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
