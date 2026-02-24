import { AfterProcessConfigs, IAfterProcessRule } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { afterMutationHandlers as dealAfterEbarimt } from '~/modules/ebarimt/afterMutations';
import { afterMutationHandlers as productPlacesAfterMutation } from '~/modules/productPlaces/afterMutations';

const ebarimtMutationNames = ['dealsChange', 'dealsEdit', 'dealsAdd'];

// You can reuse same mutation names because productPlaces
const productPlacesMutationNames = ['dealsChange', 'dealsEdit'];

const allRules: IAfterProcessRule[] = [
  {
    type: 'afterMutation',
    mutationNames: [...ebarimtMutationNames, ...productPlacesMutationNames],
  },
];

export const afterProcess: AfterProcessConfigs = {
  rules: allRules,

  afterMutation: async (ctx, input) => {
    const { mutationName, args, result, userId } = input?.data ?? {};

    if (!mutationName) return;

    const { itemId, destinationStageId, sourceStageId } = args || {};

    if (ebarimtMutationNames.includes(mutationName)) {
      const { stageId } = result || {};

      if (
        destinationStageId &&
        destinationStageId !== sourceStageId &&
        destinationStageId === stageId &&
        itemId
      ) {
        const models = await generateModels(ctx.subdomain);

        await dealAfterEbarimt(models, ctx.subdomain, ctx.processId || '', {
          sourceStageId,
          destinationStageId,
          deal: result,
          userId,
        });
      }
    }

    // PRODUCT PLACES
    if (productPlacesMutationNames.includes(mutationName)) {
      await productPlacesAfterMutation(ctx.subdomain, {
        type: 'sales:deal',
        action: 'update',
        updatedDocument: result,
        object: result,
        user: userId,
      });
    }
  },
};
