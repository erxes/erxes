import { sendCommonMessage } from './messageBroker';

export async function doAction(
  subdomain,
  serviceName,
  action,
  requestId,
  params,
  user
) {
  await sendCommonMessage({
    subdomain,
    serviceName,
    action: 'grants',
    data: {
      action,
      requestId,
      ...JSON.parse(params || '{}'),
      user,
      processId: Math.random()
    }
  });
}
