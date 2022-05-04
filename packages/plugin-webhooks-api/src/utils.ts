import { getEnv, sendRequest } from "@erxes/api-utils/src";
import { IModels } from "./connectionResolver";
import { serviceDiscovery } from './configs'
import { sendCommonMessage } from "./messageBroker";

export const sendToWebhook = async (
  models: IModels,
  { action, type, params }: { action: string; type: string; params: any }
) => {
  const webhooks = await models.Webhooks.find({
    actions: { $elemMatch: { action, type } }
  });

  if (!webhooks) {
    return;
  }

  let data = params;

  for (const webhook of webhooks) {
    if (!webhook.url || webhook.url.length === 0) {
      continue;
    }

    if (action === 'delete') {
      data = { type, object: { _id: params.object._id } };
    }

    const { slackContent, content, url } = await prepareWebhookContent(
      models,
      type,
      action,
      data
    );

    sendRequest({
      url: webhook.url,
      headers: {
        'Erxes-token': webhook.token || ''
      },
      method: 'post',
      body: {
        data: JSON.stringify(data),
        text: slackContent,
        content,
        url,
        action,
        type
      }
    })
      .then(async () => {
        await models.Webhooks.updateStatus(webhook._id, 'available');
      })
      .catch(async (e) => {
        console.log('catching error', e)
        await models.Webhooks.updateStatus(webhook._id, 'unavailable');
      });
  }
};

const prepareWebhookContent = async (_models, type, action, data) => {
  const [serviceName, contentType] = type.split(':');

  let actionText = 'created';
  let url;
  let content = '';

  switch (action) {
    case 'update':
      actionText = 'has been updated';
      break;
    case 'delete':
      actionText = 'has been deleted';
      break;
    // ! case 'createBoardItemMovementLog':
    //   content = `${type} with name ${
    //     data.data.item.name || ''
    //   } has moved from ${data.data.activityLogContent.text}`;
    //   url = data.data.link;
    default:
      actionText = 'has been created';
      break;
  }

    // * [contacts, inbox, cards]
    const services = await serviceDiscovery.getServices();

    // * contacts === 1
    const isServiceExist = services.indexOf(serviceName);

    if(isServiceExist !== -1) {
      // * contacts
      const service = await serviceDiscovery.getService(serviceName, true);

      // * contacts meta
      const meta = service.config?.meta || {};
      
      if (meta && meta.webhooks && meta.webhooks.getInfoAvailable) {
        // * send msg to contacts
        const response = await sendCommonMessage({
          subdomain: 'os',
          action: 'webhooks.getInfo',
          serviceName,
          data: {
            data,
            actionText,
            contentType
          },
          isRPC: true
        });
        console.log(response, 'response')
        

        url = response.url;
        content = response.content;
      }
    }

  // switch (type) {
    // case WEBHOOK_TYPES.CUSTOMER:
    //   url = `/contacts/details/${data.object._id}`;
    //   content = `Customer ${actionText}`;
    //   break;

    // case WEBHOOK_TYPES.COMPANY:
    //   url = `/companies/details/${data.object._id}`;
    //   content = `Company ${actionText}`;
    //   break;

    // case WEBHOOK_TYPES.KNOWLEDGEBASE:
    //   url = `/knowledgeBase?id=${data.newData.categoryIds[0]}`;
    //   content = `Knowledge base article ${actionText}`;
    //   break;

    // case WEBHOOK_TYPES.USER_MESSAGES:
    //   url = `/inbox/index?_id=${data.conversationId}`;
    //   content = 'Admin has replied to a conversation';
    //   break;

    // case WEBHOOK_TYPES.CUSTOMER_MESSAGES:
    //   url = `/inbox/index?_id=${data.conversationId}`;
    //   content = 'Customer has send a conversation message';
    //   break;

    // case WEBHOOK_TYPES.CONVERSATION:
    //   url = `/inbox/index?_id=${data._id}`;
    //   content = 'Customer has started new conversation';
    //   break;

    // case WEBHOOK_TYPES.FORM_SUBMITTED:
    //   url = `/inbox/index?_id=${data.conversationId}`;
    //   content = 'Customer has submitted a form';
    //   break;

    // case WEBHOOK_TYPES.CAMPAIGN:
    //   url = `/campaigns/show/${data._id}`;

    //   if (data.method === 'messenger') {
    //     url = `/campaigns/edit/${data.$_id}`;
    //   }

    //   content = 'Campaign has been created';
    //   break;

    // default:
    //   content = `${type} ${actionText}`;
    //   url = '';
    //   break;
  // }

  // if (
  //   [WEBHOOK_TYPES.DEAL, WEBHOOK_TYPES.TASK, WEBHOOK_TYPES.TICKET].includes(
  //     type
  //   ) &&
  //   ['create', 'update'].includes(action)
  // ) {
  //   const { object } = data;
  //   url = await getBoardItemLink(models, object.stageId, object._id);
  //   content = `${type} ${actionText}`;
  // }

  // url = `${getEnv({ name: 'MAIN_APP_DOMAIN' })}${url}`;
  url = `http://localhost:4000${url}`

  let slackContent = '';

  if (action !== 'delete') {
    slackContent = `<${url}|${content}>`;
  }

  return { slackContent, content, url };
};