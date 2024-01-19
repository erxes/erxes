import { sendMessage } from './messageBroker';
import { isEnabled } from './serviceDiscovery';

export const routeErrorHandling = (fn, callback?: any) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      console.log(e.message);

      if (callback) {
        return callback(res, e, next);
      }

      return next(e);
    }
  };
};

export const sendToWebhook = async (_messageBroker, { subdomain, data }) => {
  const isWebhooksAvailable = await isEnabled('webhooks');

  if (isWebhooksAvailable) {
    await sendMessage(`webhooks:send`, {
      subdomain,
      data,
    });
  }
};
