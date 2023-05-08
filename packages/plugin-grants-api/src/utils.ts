import { sendCommonMessage } from './messageBroker';

export async function doAction(subdomain, actions, action, params, user) {
  const serviceName = actions.find(item => item.action === action)?.scope || '';

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
