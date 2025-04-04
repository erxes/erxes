import { IModels } from './connectionResolver';
import { sendCoreMessage } from './messageBroker';

export default {
  products: ['products', 'productsTotalCount']
};

export const beforeResolverHandlers = async (
  _models: IModels,
  subdomain: string,
  params
) => {
  const { args, user } = params;
  const { segment } = args;

  if (segment) {
    return args;
  }

  const configs = await sendCoreMessage({
    subdomain,
    action: 'getConfig',
    data: { code: 'dealsProductsDefaultFilter', defaultValue: [] },
    isRPC: true,
    defaultValue: []
  });

  if (!configs?.length) {
    return args;
  }

  return { ...args, segment: configs.find(c => c.userIds?.includes(user._id))?.segmentId };
};
