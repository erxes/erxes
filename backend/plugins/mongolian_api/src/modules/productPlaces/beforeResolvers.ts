import { BeforeResolverParams } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];

export default {
  productsMain: ['productsMain', 'productsTotalCount'],
};

export const beforeResolverHandlers = async (
  subdomain: string,
  params: BeforeResolverParams,
) => {
  const models = await generateModels(subdomain);
  const { args = {}, user } = params;
  const { segment, segmentIds } = args;

  if (segment || (Array.isArray(segmentIds) && segmentIds.length)) {
    return args;
  }

  const userId =
    typeof user === 'object' &&
    user !== null &&
    '_id' in user &&
    typeof user._id === 'string'
      ? user._id
      : '';

  if (!userId) {
    return args;
  }

  const configValue = await models.Configs.getConfigValue(
    'dealsProductsDefaultFilter',
    userId,
    {},
  );
  const config =
    configValue && typeof configValue === 'object' && !Array.isArray(configValue)
      ? (configValue as { segmentIds?: unknown })
      : {};
  const defaultSegmentIds = toStringArray(config.segmentIds);

  if (!defaultSegmentIds.length) {
    return args;
  }

  return {
    ...args,
    segmentIds: defaultSegmentIds,
  };
};
