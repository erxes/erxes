import { sendCommonMessage } from './messageBroker';

export async function doAction(subdomain, serviceName, action, params, user) {
  await sendCommonMessage({
    subdomain,
    serviceName,
    action,
    data: {
      ...JSON.parse(params || '{}'),
      user,
      processId: Math.random()
    }
  });
}
