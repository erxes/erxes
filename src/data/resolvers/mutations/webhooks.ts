import { Webhooks } from '../../../db/models';
import { WEBHOOK_STATUS } from '../../../db/models/definitions/constants';
import { IWebhook } from '../../../db/models/definitions/webhook';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { sendRequest } from '../../utils';

interface IWebhookEdit extends IWebhook {
  _id: string;
}

const webhookMutations = {
  /**
   * Creates a new webhook
   */
  async webhooksAdd(_root, doc: IWebhook, { user, docModifier }: IContext) {
    const webhook = await Webhooks.createWebhook(docModifier(doc));

    sendRequest({
      url: webhook.url,
      headers: {
        'Erxes-token': webhook.token || '',
      },
      method: 'post',
    })
      .then(async () => {
        await Webhooks.updateStatus(webhook._id, WEBHOOK_STATUS.AVAILABLE);
      })
      .catch(async () => {
        await Webhooks.updateStatus(webhook._id, WEBHOOK_STATUS.UNAVAILABLE);
      });

    await putCreateLog(
      {
        type: MODULE_NAMES.WEBHOOK,
        newData: webhook,
        object: webhook,
        description: `${webhook.url} has been created`,
      },
      user,
    );

    return webhook;
  },

  /**
   * Edits a webhook
   */
  async webhooksEdit(_root, { _id, ...doc }: IWebhookEdit, { user }: IContext) {
    const webhook = await Webhooks.getWebHook(_id);
    const updated = await Webhooks.updateWebhook(_id, doc);

    await putUpdateLog(
      {
        type: MODULE_NAMES.WEBHOOK,
        object: webhook,
        newData: doc,
        description: `${webhook.url} has been edited`,
      },
      user,
    );

    return updated;
  },

  /**
   * Removes a webhook
   */
  async webhooksRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const webhook = await Webhooks.getWebHook(_id);
    const removed = await Webhooks.removeWebhooks(_id);

    await putDeleteLog(
      {
        type: MODULE_NAMES.WEBHOOK,
        object: webhook,
        description: `${webhook.url} has been removed`,
      },
      user,
    );

    return removed;
  },
};

moduleCheckPermission(webhookMutations, 'manageWebhooks');

export default webhookMutations;
