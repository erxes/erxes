import { replacePlaceHolders as utilsReplacePlaceHolders } from "@erxes/api-utils/src/automations";
import { IModels, generateModels } from "./connectionResolver";
import { sendCoreMessage } from "./messageBroker";
import { sendEmails } from "@erxes/plugin-automations-api/src/common/email/sendEmails";
import { getEnv } from "@erxes/plugin-automations-api/src/utils";
import { getConfig } from "./utils";

const timeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);

const generateSegmentFilter = async (subdomain: string, segment: any) => {
  const segmentIds = segment.conditions.map((cond: any) => cond.subSegmentId);

  const segments = await timeout(
    sendCoreMessage({
      subdomain,
      action: "segmentFind",
      data: { _id: { $in: segmentIds } },
      isRPC: true,
    }),
    8000
  );

  let productIds: string[] = [];

  for (const { conditions } of segments) {
    if (!conditions) continue;

    for (const { propertyName, propertyOperator, propertyValue } of conditions) {
      if (propertyName?.includes("productId") && propertyOperator === "e") {
        productIds = [...productIds, propertyValue];
      }
    }
  }

  return productIds;
};

const getRelatedValue = async (
  models: IModels,
  subdomain: string,
  target: any,
  targetKey: string,
  relatedValueProps: any
) => {
  if (targetKey === "items.count") {
    let totalCount = 0;

    const execution = relatedValueProps.execution;
    const triggerConfig = execution.triggerConfig;

    let items = target.items || [];

    const segment = await timeout(
      sendCoreMessage({
        subdomain,
        action: "segmentFindOne",
        data: { _id: triggerConfig?.contentId },
        isRPC: true,
      }),
      8000
    );

    const productIds = await generateSegmentFilter(subdomain, segment);

    if (productIds.length > 0) {
      items = items.filter((item: any) => productIds.includes(item.productId));
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
            type: "customer",
          },
        ],
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
            type: "customer",
          },
        ],
      },
    ],
  },

  checkCustomTrigger: async ({ data }: any) => {
    const { collectionType, target } = data;
    return collectionType === "posOrder.paid" && !!target.paidDate;
  },

  replacePlaceHolders: async ({
    subdomain,
    data,
  }: {
    subdomain: string;
    data: any;
  }) => {
    const { target, config, execution } = data;
    const models = generateModels(subdomain);

    const value = await timeout(
      utilsReplacePlaceHolders({
        models,
        subdomain,
        getRelatedValue,
        actionData: config,
        target,
        relatedValueProps: { execution },
        complexFields: ["items"],
      }),
      10000
    );

    let recipientIds =
      value.attributionMail?.length
        ? value.attributionMail
        : target?.customerId
        ? [target.customerId]
        : [];

    let directEmail = "";
    if (!recipientIds.length) {
      directEmail =
        target.customerEmail ||
        target.email ||
        (target.customer && target.customer.email);
    }

    const type = target?.customerType || "customer";
    let emails: string[] = [];

    if (directEmail) {
      emails = [directEmail];
    } else if (recipientIds.length) {
      emails = await timeout(
        sendCoreMessage({
          subdomain,
          action: "automations.getRecipientsEmails",
          data: {
            type,
            config: {
              [`${type}Ids`]: recipientIds,
              skipEmailValidation: true,
            },
          },
          isRPC: true,
        }),
        8000
      );
    }

    if (!emails.length && target.email) {
      emails = [target.email];
    }

    if (!emails.length) {
      return value;
    }

    try {
      let fromEmail = value.fromEmail;

      if (!fromEmail) {
        const configs = await timeout(
          sendCoreMessage({
            subdomain,
            action: "getConfigs",
            data: {},
            isRPC: true,
            defaultValue: {},
          }),
          8000
        );

        const ALLOW_UNVERIFIED = getConfig(
          configs,
          "ALLOW_UNVERIFIED_POS_EMAILS",
          "false"
        );
        fromEmail = value?.fromEmail?.trim() || "";
      }

      await timeout(
        sendEmails({
          subdomain,
          params: {
            title: value.emailTitle || "POS Order Receipt",
            fromEmail: fromEmail || "info@erxes.io",
            toEmails: emails,
            ccEmails: value.ccEmails || [],
            customHtml:
              value.emailHtml || "<p>Thank you for your purchase!</p>",
          },
        }),
        10000
      );
    } catch (err: any) {

    }

    return value;
  },
};
