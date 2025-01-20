import { sendMessage, MessageArgsOmitService } from "@erxes/api-utils/src/core";
import { sendToWebhook as sendWebhook } from "@erxes/api-utils/src";
import { generateModels, IModels } from "./connectionResolver";
import { start, sendBulkSms, sendEmail } from "./sender";
import { CAMPAIGN_KINDS } from "./constants";
import {
  consumeQueue,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";
import { debugError, debugInfo } from "@erxes/api-utils/src/debuggers";

export const setupMessageConsumers = async () => {
  consumeQueue("engages:pre-notification", async ({ data, subdomain }) => {
    const models = await generateModels(subdomain);

    const { engageMessage, customerInfos = [] } = data;
    if (
      engageMessage.kind === CAMPAIGN_KINDS.MANUAL &&
      customerInfos.length === 0
    ) {
      await models.Logs.createLog(
        engageMessage._id,
        "failure",
        "No customers found"
      );
      throw new Error("No customers found");
    }

    const MINUTELY =
      engageMessage.scheduleDate &&
      engageMessage.scheduleDate.type === "minute";

    if (
      !(
        engageMessage.kind === CAMPAIGN_KINDS.AUTO &&
        MINUTELY &&
        customerInfos.length === 0
      )
    ) {
      await models.Logs.createLog(
        engageMessage._id,
        "regular",
        `Matched ${customerInfos.length} customers`
      );
    }

    if (
      engageMessage.scheduleDate &&
      engageMessage.scheduleDate.type === "pre"
    ) {
      await models.EngageMessages.updateOne(
        { _id: engageMessage._id },
        { $set: { "scheduleDate.type": "sent" } }
      );
    }

    if (customerInfos.length > 0) {
      await models.EngageMessages.updateOne(
        { _id: engageMessage._id },
        { $set: { totalCustomersCount: customerInfos.length } }
      );
    }
  });

  consumeQueue("engages:notification", async ({ subdomain, data }) => {
    debugInfo(`Receiving queue data ${JSON.stringify(data, null, 2)}`);
    const models = (await generateModels(subdomain)) as IModels;

    try {
      const { action, data: realData } = data;

      if (action === "sendEngage") {
        await start(models, subdomain, realData);
      }

      if (action === "writeLog") {
        await models.Logs.createLog(data.engageMessageId, "regular", data.msg);
      }

      if (action === "sendEngageSms") {
        await sendBulkSms(models, subdomain, realData);
      }
    } catch (e) {
      debugError(e.message);
    }
  });

  consumeQueue(
    "engages:removeCustomersEngages",
    async ({ data: { customerIds }, subdomain }) => {
      const models = await generateModels(subdomain);

      await models.EngageMessages.removeCustomersEngages(customerIds);
    }
  );

  consumeQueue(
    "engages:changeCustomer",
    async ({ data: { customerId, customerIds }, subdomain }) => {
      const models = await generateModels(subdomain);

      await models.EngageMessages.changeCustomer(customerId, customerIds);
    }
  );

  consumeRPCQueue(
    "engages:createVisitorOrCustomerMessages",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.EngageMessages.createVisitorOrCustomerMessages(data)
      };
    }
  );

  consumeQueue("engages:sendEmail", async ({ data, subdomain }) => {
    const models = await generateModels(subdomain);

    await sendEmail(subdomain, models, data);
  });
};

export const removeEngageConversations = async (_id: string): Promise<any> => {
  // FIXME: This doesn't look like it should be calling consumeQueue
  // return consumeQueue('removeEngageConversations', _id);
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args
  });
};

export const sendInboxMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "inbox",
    ...args
  });
};

export const sendSegmentsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "segments",
    ...args
  });
};

export const sendIntegrationsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "integrations",
    ...args
  });
};

export const sendClientPortalMessage = (args: MessageArgsOmitService) => {
  return sendMessage({
    serviceName: "clientportal",
    ...args
  });
};

export const sendImapMessage = (args: MessageArgsOmitService) => {
  return sendMessage({
    serviceName: "imap",
    ...args
  });
};

export const sendNotificationsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "notifications",
    ...args
  });
};

export const sendToWebhook = ({ subdomain, data }) => {
  return sendWebhook({ subdomain, data });
};
