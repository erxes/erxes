import { TRecordReferencesConfig } from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';
import { ticketReferenceFetchers } from '~/modules/ticket/meta/references/ticketReferenceFetchers';
import { TICKET_REFERENCE_TYPES } from '~/modules/ticket/meta/references/ticketReferenceTypes';

export const frontlineReferences: TRecordReferencesConfig<IModels> = {
  types: [...TICKET_REFERENCE_TYPES],
  fetchers: {
    ...ticketReferenceFetchers,
  },
  resolvers: {},
  generateModels,
};
