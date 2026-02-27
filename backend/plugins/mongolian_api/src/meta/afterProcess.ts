import { AfterProcessConfigs, IAfterProcessRule } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { afterMutationHandlers as dealAfterEbarimt } from '~/modules/ebarimt/afterMutations';
import { afterMutationHandlers as productPlacesAfterMutation } from '~/modules/productPlaces/afterMutations';
console.log('✅ afterProcess.ts loaded');
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
    console.log('🔥 afterProcess triggered', {
      mutationName,
      args: JSON.stringify(args),
      resultId: result?._id,
      userId,
    });
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
      console.log('🔥 afterProcess: productPlaces condition met', {
        mutationName,
        sourceStageId,
        destinationStageId,
        resultStageId: result?.stageId,
        itemId,
      });

      await productPlacesAfterMutation(ctx.subdomain, {
        type: 'sales:deal',
        action: 'update',
        updatedDocument: result,

        object: {
          stageId: sourceStageId,
        },
        user: userId,
      });
    }
  },
};
