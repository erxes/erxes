import { BeforeResolverParams } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

export default {
  products: ['products', 'productsTotalCount'],
};

export const beforeResolverHandlers = async (
  subdomain: string,
  params: BeforeResolverParams,
) => {
  const models = await generateModels(subdomain);
  const { args = {}, user } = params;
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

  const userId =
    typeof user === 'object' && user !== null && '_id' in user
      ? user._id
      : undefined;

  return {
    ...args,
    segment: configs.find((config) =>
      Array.isArray(config?.userIds) ? config.userIds.includes(userId) : false,
    )?.segmentId,
  };
};
