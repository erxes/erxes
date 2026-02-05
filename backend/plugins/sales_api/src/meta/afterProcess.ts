import { AfterProcessConfigs, IAfterProcessRule } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { subscriptionWrapper } from '~/modules/sales/graphql/resolvers/utils';

const mutationNames = ['manageRelations'];
const allRules: IAfterProcessRule[] = [
  {
    type: 'afterMutation',
    mutationNames: mutationNames
  }
];


export const afterProcess: AfterProcessConfigs = {
  rules: allRules,
  afterMutation: async (ctx, input) => {
    const { mutationName, args, result } = input?.data;

    if (!mutationNames.includes(mutationName)) {
      return;
    }
    const { contentType, contentId, relatedContentType, relatedContentIds } = args;
    if (result.length !== relatedContentIds.length) {
      return;
    }
    if (!(contentType === 'sales:deal' || relatedContentType === 'sales:deal')) {
      return;
    }

    const models = await generateModels(ctx.subdomain);
    const dealIds = contentType === 'sales:deal' && [contentId] || relatedContentIds

    const deals = await models.Deals.find({ _id: { $in: dealIds } }).lean();

    for (const deal of deals) {
      await subscriptionWrapper(
        models,
        {
          action: 'update',
          deal,
          oldDeal: deal
        }
      );
    }

  }
};
