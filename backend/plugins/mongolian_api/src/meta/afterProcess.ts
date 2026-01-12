import { AfterProcessConfigs, IAfterProcessRule } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { afterMutationHandlers as dealAfterEbarimt } from '~/modules/ebarimt/afterMutations';

const ebarimtMutationNames = ['dealsChange', 'dealsEdit', 'dealsAdd'];
const allRules: IAfterProcessRule[] = [
  {
    type: 'afterMutation',
    mutationNames: ebarimtMutationNames
  }
];


export const afterProcess: AfterProcessConfigs = {
  rules: allRules,
  afterMutation: (ctx, input) => {
    void (async () => {
      const { mutationName, args, result, userId } = input;
      if (ebarimtMutationNames.includes(mutationName)) {
        const { itemId, destinationStageId, sourceStageId } = args;
        const { stageId } = result;
        if (destinationStageId && destinationStageId !== sourceStageId && destinationStageId === stageId && itemId) {
          const models = await generateModels(ctx.subdomain);
          await dealAfterEbarimt(models, ctx.subdomain, ctx.processId || '', {
            sourceStageId,
            destinationStageId,
            deal: result,
            userId
          });

        }
      }
    })
  }
};
