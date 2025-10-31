import { IBrowserInfo } from 'erxes-api-shared/core-types';
import {
  client,
  getIndexPrefix,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { debugError, debugInfo } from '~/modules/inbox/utils';

export const getOrCreateEngageMessage = async (
  models: IModels,
  subdomain: string,
  integrationId: string,
  browserInfo: IBrowserInfo,
  visitorId?: string,
  customerId?: string,
) => {
  let customer;

  if (customerId) {
    customer = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: {
        query: {
          _id: customerId,
        },
      },
    });
  }

  if (!customer && !visitorId) {
    return null;
  }

  // find conversations
  const query = customerId
    ? { integrationId, customerId }
    : { integrationId, visitorId };

  const convs = await models.Conversations.find(query);

  return await models.ConversationMessages.findOne(
    await models.Conversations.widgetsUnreadMessagesQuery(convs),
  );
};

export const receiveVisitorDetail = async (subdomain: string, visitor) => {
  const { visitorId } = visitor;

  const { visitorId: _, _id: __, ...visitorData } = visitor;

  const customer = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'customers',
    action: 'updateOne',
    input: {
      selector: { visitorId },
      modifier: { $set: visitorData },
    },
  });

  const index = `${getIndexPrefix()}events`;

  try {
    const response = await client.updateByQuery({
      index,
      body: {
        script: {
          lang: 'painless',
          source:
            'ctx._source.visitorId = null; ctx._source.customerId = params.customerId',
          params: {
            customerId: customer._id,
          },
        },
        query: {
          term: {
            visitorId,
          },
        },
      },
    });

    debugInfo(`Response ${JSON.stringify(response)}`);
  } catch (e) {
    debugError(`Update event error ${e.message}`);
  }

  return customer;
};
