import { IBrowserInfo } from "@erxes/api-utils/src/definitions/common";
import { debugInfo, debugError } from "@erxes/api-utils/src/debuggers";

import {
  sendCoreMessage,
  sendEngagesMessage
} from "./messageBroker";
import { IModels } from "./connectionResolver";
import { client, getIndexPrefix } from "@erxes/api-utils/src/elasticsearch";

export const getOrCreateEngageMessage = async (
  models: IModels,
  subdomain: string,
  integrationId: string,
  browserInfo: IBrowserInfo,
  visitorId?: string,
  customerId?: string
) => {
  let customer;

  if (customerId) {
    customer = await sendCoreMessage({
      subdomain,
      action: "customers.findOne",
      data: {
        _id: customerId
      },
      isRPC: true
    });
  }

  if (!customer && !visitorId) {
    return null;
  }

  const integration = await models.Integrations.getIntegration({
    _id: integrationId,
    kind: "messenger"
  });

  const brand = await sendCoreMessage({
    subdomain,
    action: "brands.findOne",
    data: {
      query: {
        _id: integration.brandId
      }
    },
    isRPC: true,
    defaultValue: {}
  });

  // try to create engage chat auto messages
  await sendEngagesMessage({
    subdomain,
    action: "createVisitorOrCustomerMessages",
    data: {
      brandId: brand._id,
      integrationId: integration._id,
      customer,
      visitorId,
      browserInfo
    },
    isRPC: true
  });

  // find conversations
  const query = customerId
    ? { integrationId, customerId }
    : { integrationId, visitorId };

  const convs = await models.Conversations.find(query);

  return models.ConversationMessages.findOne(
    models.Conversations.widgetsUnreadMessagesQuery(convs)
  );
};

export const receiveVisitorDetail = async (subdomain: string, visitor) => {
  const { visitorId } = visitor;

  delete visitor.visitorId;
  delete visitor._id;

  const customer = await sendCoreMessage({
    subdomain,
    action: "customers.updateOne",
    data: {
      selector: { visitorId },
      modifier: { $set: visitor }
    },
    isRPC: true
  });

  const index = `${getIndexPrefix()}events`;

  try {
    const response = await client.updateByQuery({
      index,
      body: {
        script: {
          lang: "painless",
          source:
            "ctx._source.visitorId = null; ctx._source.customerId = params.customerId",
          params: {
            customerId: customer._id
          }
        },
        query: {
          term: {
            visitorId
          }
        }
      }
    });

    debugInfo(`Response ${JSON.stringify(response)}`);
  } catch (e) {
    debugError(`Update event error ${e.message}`);
  }

  await sendCoreMessage({
    subdomain,
    action: "visitor.removeEntry",
    data: {
      visitorId
    }
  });

  return customer;
};
