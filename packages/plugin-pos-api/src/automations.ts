import { replacePlaceHolders } from "@erxes/api-utils/src/automations";
import { IModels, generateModels } from "./connectionResolver";
import { sendCoreMessage } from "./messageBroker";

const generateSegmentFilter = async (subdomain, segment) => {
  const segmentIds = segment.conditions.map(cond => cond.subSegmentId);

  const segments = await sendCoreMessage({
    subdomain,
    action: "segmentFind",
    data: { _id: { $in: segmentIds } },
    isRPC: true
  });

  let productIds: string[] = [];

  for (const { conditions } of segments) {
    for (const {
      propertyName,
      propertyOperator,
      propertyValue
    } of conditions) {
      if (propertyName.includes("productId") && propertyOperator === "e") {
        productIds = [...productIds, propertyValue];
      }
    }
  }
  return productIds;
};

const getRelatedValue = async (
  models: IModels,
  subdomain: string,
  target,
  targetKey,
  relatedValueProps
) => {
  if (targetKey === "items.count") {
    let totalCount = 0;

    const { execution } = relatedValueProps;
    const { triggerConfig } = execution;
    let { items = [] } = target;

    const segment = await sendCoreMessage({
      subdomain,
      action: "segmentFindOne",
      data: { _id: triggerConfig?.contentId },
      isRPC: true
    });

    const productIds = await generateSegmentFilter(subdomain, segment);

    if (productIds.length > 0) {
      items = items.filter(item => productIds.includes(item.productId));
    }

    for (const item of items) {
      totalCount += item?.count || 0;
    }

    return totalCount;
  }

  return null;
};

export default {
  constants: {
    triggers: [
      {
        type: "pos:posOrder",
        img: "automation3.svg",
        icon: "lamp",
        label: "Pos order",
        description:
          "Start with a blank workflow that enrolls and is triggered off Pos orders",
        additionalAttributes: [
          {
            _id: Math.random(),
            name: "customerId",
            label: "Customer",
            type: "customer"
          }
        ]
      },
      {
        type: "pos:posOrder.paid",
        img: "automation3.svg",
        icon: "lamp",
        label: "Pos order when paid",
        isCustom: true,
        description:
          "Start with a blank workflow that enrolls and is triggered off Pos order paid",
        additionalAttributes: [
          {
            _id: Math.random(),
            name: "customerId",
            label: "Customer",
            type: "customer"
          }
        ]
      }
    ]
  },

  checkCustomTrigger: async ({ data }) => {
    const { collectionType, target } = data;

    if (collectionType === "posOrder.paid") {
      if (target.paidDate) {
        return true;
      }
    }

    return false;
  },
  replacePlaceHolders: async ({
    subdomain,
    data: { target, config, execution }
  }) => {
    const models = generateModels(subdomain);
    const value = await replacePlaceHolders({
      models,
      subdomain,
      getRelatedValue,
      actionData: config,
      target,
      relatedValueProps: { execution },
      complexFields: ["items"]
    });

    if (value.attributionMail) {
      const type = target?.customerType || "customer";

      const result = await sendCoreMessage({
        subdomain,
        action: "automations.getRecipientsEmails",
        data: {
          type,
          config: {
            [`${type}Ids`]: value.attributionMail
          }
        },
        isRPC: true
      });

      value.attributionMail = result;
    }

    return value;
  }
};
