import { TRecordReferencesConfig } from 'erxes-api-shared/core-modules';
import { getEnv } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { ITicketDocument } from '~/modules/ticket/@types/ticket';

export const ticketReferenceCustomResolvers: TRecordReferencesConfig<
  IModels,
  ITicketDocument
>['resolvers'] = {
  ticketLink: ({ target, subdomain }) => {
    const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

    return `${DOMAIN}/frontline/tickets?ticketId=${target._id}`;
  },
};
