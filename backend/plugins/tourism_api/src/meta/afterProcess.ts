import { AfterProcessConfigs, IAfterProcessRule } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import {
  handleCoreMergeMutation,
  mergeMutationNames,
} from './afterProcessHandlers/coreMerge';

const allRules: IAfterProcessRule[] = [
  {
    type: 'afterMutation',
    mutationNames: [...mergeMutationNames],
  },
];

export const afterProcess: AfterProcessConfigs = {
  rules: allRules,
  afterMutation: async (ctx, input) => {
    await handleCoreMergeMutation(
      await generateModels(ctx.subdomain),
      input?.data,
    );
  },
};
