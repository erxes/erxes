import { TRecordReferencesConfig } from 'erxes-api-shared/core-modules';
import { salesReferenceFetchers } from '~/modules/sales/meta/references/salesReferenceFetchers';
import { SALES_REFERENCE_TYPES } from '~/modules/sales/meta/references/salesReferenceTypes';
import { salesReferenceCustomResolvers } from '~/modules/sales/meta/references/salesRefernceCustomResolvers';
import { generateModels } from '~/connectionResolvers';

export const salesReferences: TRecordReferencesConfig = {
  types: [...SALES_REFERENCE_TYPES],

  fetchers: {
    ...salesReferenceFetchers,
  },

  resolvers: {
    ...salesReferenceCustomResolvers,
  },
  generateModels,
};
