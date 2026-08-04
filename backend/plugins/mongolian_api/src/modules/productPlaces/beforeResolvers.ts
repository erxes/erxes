import { IModels } from '~/connectionResolvers';

export default {
  products: ['products', 'productsTotalCount'],
};

export const beforeResolverHandlers = async (
  models: IModels,
  subdomain: string,
  params,
) => {
  const { args, user } = params;
  const { segment } = args;

  if (segment) {
    return args;
  }

  const configValue = await models.Configs.getConfigValue(
    'dealsProductsDefaultFilter',
    '',
    null,
  );
  let configs = Array.isArray(configValue)
    ? configValue
    : Object.values(configValue || {});

  if (!configs?.length) {
    configs = (await models.Configs.getConfigs('dealsProductsDefaultFilter'))
      .map((config) => config.value)
      .flat();
  }

  if (!configs?.length) {
    return args;
  }

  return {
    ...args,
    segment: configs.find((c) => c.userIds?.includes(user._id))?.segmentId,
  };
};
