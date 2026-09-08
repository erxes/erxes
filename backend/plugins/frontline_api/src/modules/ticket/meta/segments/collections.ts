import {
  SegmentMembershipCollection,
  SegmentOwnedSource,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { TICKET_TYPE } from './fields';

type TicketCollection = {
  find: (
    query: Record<string, unknown>,
    projection?: Record<string, 1>,
  ) => { lean: () => Promise<Record<string, unknown>[]> };
  aggregate: (
    pipeline: Record<string, unknown>[],
  ) => Promise<Record<string, unknown>[]>;
};

export const ticketSegmentSource = (
  models: IModels,
  contentType: string,
): SegmentOwnedSource | null => {
  if (contentType !== TICKET_TYPE) {
    return null;
  }

  const collection = models.Ticket as unknown as TicketCollection;

  return {
    find: (query, projection) => collection.find(query, projection).lean(),
    aggregate: (pipeline) => collection.aggregate(pipeline),
  };
};

export const ticketMembershipCollections = (
  models: IModels,
): Record<string, SegmentMembershipCollection> => ({
  [TICKET_TYPE]: models.Ticket as unknown as SegmentMembershipCollection,
});
