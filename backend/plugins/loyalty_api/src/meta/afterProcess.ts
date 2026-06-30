import { AfterProcessConfigs } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import {
  handleCoreMergeMutation,
  mergeMutationNames,
} from './afterProcessHandlers/coreMerge';

export const afterProcess: AfterProcessConfigs = {
  rules: [
    {
      type: 'afterMutation',
      mutationNames: [...mergeMutationNames],
    },
  ],
  afterMutation: async (ctx, input) => {
    await handleCoreMergeMutation(
      await generateModels(ctx.subdomain),
      input?.data,
    );
  },
};
