import { TRecordReferencesConfig } from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';
import { coreReferenceCustomResolvers } from './referenceCustomResolvers';
import { coreReferenceFetchers } from './referenceFetchers';
import { CORE_REFERENCE_TYPES } from './referenceTypes';

export const references: TRecordReferencesConfig<IModels> = {
  types: [...CORE_REFERENCE_TYPES],

  fetchers: {
    ...coreReferenceFetchers,
  },

  resolvers: {
    ...coreReferenceCustomResolvers,
  },

  generateModels,
};
