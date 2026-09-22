import {
  AfterProcessConfigs,
  AfterProcessModules,
} from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';
import { inboxAfterProcessWorkers } from '@/inbox/meta/afterProcess';
import { facebookAfterProcessWorkers } from '@/integrations/facebook/meta/afterProcess/afterProcessWorkers';
import {
  createAfterDocumentCreatedHandler,
  createAfterDocumentUpdatedHandler,
} from './afterProcess/handlers';
import {
  handleCoreMergeMutation,
  mergeMutationNames,
} from './afterProcessHandlers/coreMerge';

const afterProcessModules: AfterProcessModules<IModels> = {
  facebook: facebookAfterProcessWorkers,
  inbox: inboxAfterProcessWorkers,
};

const allRules = [
  ...facebookAfterProcessWorkers.rules,
  ...inboxAfterProcessWorkers.rules,
  {
    type: 'afterMutation' as const,
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
  afterDocumentCreated: createAfterDocumentCreatedHandler(afterProcessModules),
  afterDocumentUpdated: createAfterDocumentUpdatedHandler(afterProcessModules),
};
