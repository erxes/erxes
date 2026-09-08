import {
  SegmentMembershipCollection,
  SegmentOwnedSource,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export const DEAL_TYPE = 'sales:sales.deals';

type SalesCollection = {
  find: (
    query: Record<string, unknown>,
    projection?: Record<string, 1>,
  ) => { lean: () => Promise<Record<string, unknown>[]> };
  aggregate: (
    pipeline: Record<string, unknown>[],
  ) => Promise<Record<string, unknown>[]>;
};

const collectionFor = (
  models: IModels,
  contentType: string,
): SalesCollection | null => {
  const as = (model: unknown) => model as SalesCollection;

  if (contentType === DEAL_TYPE) {
    return as(models.Deals);
  }

  return null;
};

export const salesSegmentSource = (
  models: IModels,
  contentType: string,
): SegmentOwnedSource | null => {
  const collection = collectionFor(models, contentType);

  if (!collection) {
    return null;
  }

  return {
    find: (query, projection) => collection.find(query, projection).lean(),
    aggregate: (pipeline) => collection.aggregate(pipeline),
  };
};

export const salesMembershipCollections = (
  models: IModels,
): Record<string, SegmentMembershipCollection> => ({
  [DEAL_TYPE]: models.Deals as unknown as SegmentMembershipCollection,
});
