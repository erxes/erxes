import { debugInfo } from "@erxes/api-utils/src/debuggers";
import { generateModels } from "../connectionResolver";
import { actionCreateComment, checkCommentTrigger } from "./comments";
import { actionCreateMessage, checkMessageTrigger } from "./messages";
import {
  replacePlaceHolders,
  setProperty
} from "@erxes/api-utils/src/automations";
import { sendMessage as sendCommonMessage } from "@erxes/api-utils/src/core";
import { checkAdsTrigger } from "./utils";

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
        type: "facebook:messages.create",
        icon: "messenger",
        label: "Send Facebook Message",
        description: "Send Facebook Message",
        isAvailable: true,
        isAvailableOptionalConnect: true
      },
      {
        type: "facebook:comments.create",
        icon: "comments-alt",
        label: "Send Facebook Comment",
        description: "Send Facebook Comments",
        isAvailable: true
      }
    ],
    triggers: [
      {
        type: "facebook:messages",
        img: "automation3.svg",
        icon: "messenger",
        label: "Facebook Message",
        description:
          "Start with a blank workflow that enrolls and is triggered off facebook messages",
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
      },
      {
        type: "facebook:comments",
        img: "automation4.svg",
        icon: "comments",
        label: "Facebook Comments",
        description:
          "Start with a blank workflow that enrolls and is triggered off facebook comments",
        isCustom: true
      },
      {
        type: "facebook:ads",
        img: "automation4.svg",
        icon: "tag-alt",
        label: "Facebook Ads Message",
        description:
          "Start with a blank workflow that enrolls and is triggered off clicked send message on facebook ads",
        isCustom: true
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
        case "comments":
          return await actionCreateComment(
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
      case "comments":
        return await checkCommentTrigger(subdomain, data);
      case "ads":
        return await checkAdsTrigger(subdomain, data);
      default:
        return false;
    }
  }
};
