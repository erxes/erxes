import { AfterProcessConfigs, IAfterProcessRule } from 'erxes-api-shared/utils';
import { IModels, generateModels } from '~/connectionResolvers';
import { subscriptionWrapper } from '~/modules/sales/graphql/resolvers/utils';
import { productMutationNames, syncPosProductGroups } from './productUtils';

const relationMutationNames = ['manageRelations'];

const mutationNames = [...relationMutationNames, ...productMutationNames];

const allRules: IAfterProcessRule[] = [
  {
    type: 'afterMutation',
    mutationNames,
  },
];

type MutationData = {
  mutationName?: string;
  args?: Record<string, unknown>;
  result?: unknown;
};

const isString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

const syncDealRelationSubscriptions = async (
  models: IModels,
  args: Record<string, unknown>,
  result: unknown,
) => {
  const { contentType, contentId, relatedContentType, relatedContentIds } =
    args;

  if (!Array.isArray(result) || !Array.isArray(relatedContentIds)) {
    return;
  }

  if (result.length !== relatedContentIds.length) {
    return;
  }

  if (!(contentType === 'sales:deal' || relatedContentType === 'sales:deal')) {
    return;
  }

  const dealIds =
    contentType === 'sales:deal' && isString(contentId)
      ? [contentId]
      : relatedContentIds.filter(isString);

  const deals = await models.Deals.find({ _id: { $in: dealIds } }).lean();

  for (const deal of deals) {
    await subscriptionWrapper(models, {
      action: 'update',
      deal,
      oldDeal: deal,
    });
  }
};

export const afterProcess: AfterProcessConfigs = {
  rules: allRules,
  afterMutation: async (ctx, input) => {
    const {
      mutationName,
      args = {},
      result,
    } = (input?.data || {}) as MutationData;

    if (!mutationName || !mutationNames.includes(mutationName)) {
      return;
    }

    const models = await generateModels(ctx.subdomain);

    if (relationMutationNames.includes(mutationName)) {
      await syncDealRelationSubscriptions(models, args, result);
      return;
    }

    if (productMutationNames.includes(mutationName)) {
      await syncPosProductGroups(
        ctx.subdomain,
        models,
        mutationName,
        args,
        result,
      );
    }
  },
};
