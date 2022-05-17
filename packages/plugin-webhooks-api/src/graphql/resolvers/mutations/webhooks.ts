import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
import { WEBHOOK_STATUS } from '../../../models/definitions/constants';
import { IWebhook } from '../../../models/definitions/webhooks';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { sendRequest } from '@erxes/api-utils/src';

interface IWebhookEdit extends IWebhook {
  _id: string;
}

const WEBHOOK = 'webhook';

const webhookMutations = {
  /**
   * Creates a new webhook
   */
  async webhooksAdd(
    _root,
    doc: IWebhook,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const webhook = await models.Webhooks.createWebhook(docModifier(doc));

    sendRequest({
      url: webhook.url,
      headers: {
        'Erxes-token': webhook.token || ''
      },
      method: 'post',
      body: {
        text: 'You have successfully connected erxes webhook'
      }
    })
      .then(async () => {
        await models.Webhooks.updateStatus(
          webhook._id,
          WEBHOOK_STATUS.AVAILABLE
        );
      })
      .catch(async err => {
        console.log('error ', err);
        await models.Webhooks.updateStatus(
          webhook._id,
          WEBHOOK_STATUS.UNAVAILABLE
        );
      });

    await putCreateLog(
      subdomain,
      {
        type: WEBHOOK,
        newData: webhook,
        object: webhook,
        description: `${webhook.url} has been created`
      },
      user
    );

    return webhook;
  },

  /**
   * Edits a webhook
   */
  async webhooksEdit(
    _root,
    { _id, ...doc }: IWebhookEdit,
    { user, models, subdomain }: IContext
  ) {
    const webhook = await models.Webhooks.getWebHook(_id);
    const updated = await models.Webhooks.updateWebhook(_id, doc);

    sendRequest({
      url: webhook.url,
      headers: {
        'Erxes-token': webhook.token || ''
      },
      method: 'post',
      body: {
        text: 'You have successfully connected erxes webhook'
      }
    })
      .then(async () => {
        await models.Webhooks.updateStatus(
          webhook._id,
          WEBHOOK_STATUS.AVAILABLE
        );
      })
      .catch(async err => {
        console.log('error ', err);
        await models.Webhooks.updateStatus(
          webhook._id,
          WEBHOOK_STATUS.UNAVAILABLE
        );
      });

    await putUpdateLog(
      subdomain,
      {
        type: WEBHOOK,
        object: webhook,
        newData: doc,
        description: `${webhook.url} has been edited`
      },
      user
    );

    return updated;
  },

  /**
   * Removes a webhook
   */
  async webhooksRemove(
    _root,
    { _id }: { _id: string },
    { models, subdomain, user }: IContext
  ) {
    const webhook = await models.Webhooks.getWebHook(_id);
    const removed = await models.Webhooks.removeWebhooks(_id);

    await putDeleteLog(
      subdomain,
      {
        type: WEBHOOK,
        object: webhook,
        description: `${webhook.url} has been removed`
      },
      user
    );

    return removed;
  }
};

moduleCheckPermission(webhookMutations, 'manageWebhooks');

export default webhookMutations;
