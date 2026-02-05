import { IModels } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

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

  const configs = await sendTRPCMessage({
  subdomain,
  pluginName: 'core',
  module: 'configs',
  action: 'getConfig',
  method: 'query',
  input: {
    code: 'dealsProductsDefaultFilter',
    defaultValue: [],
  },
  defaultValue: [],
});


  if (!configs?.length) {
    return args;
  }

  return { ...args, segment: configs.find(c => c.userIds?.includes(user._id))?.segmentId };
};
