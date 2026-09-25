import {
  applySegmentMembership,
  SegmentApplyMembershipResult,
  SegmentMembershipCollection,
  SegmentMembershipUpdate,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { segmentSource } from './collections';
import { CORE_SEGMENT_CONTENT_TYPES } from './contentTypes';

const CORE_MEMBERSHIP_TYPES = CORE_SEGMENT_CONTENT_TYPES.map(
  (declared) => declared.contentType,
).filter((contentType): contentType is string => Boolean(contentType));

export const applyCoreSegmentMembership = async (
  models: IModels,
  data: { contentType: string; updates: SegmentMembershipUpdate[] },
): Promise<SegmentApplyMembershipResult> => {
  const collections: Record<string, SegmentMembershipCollection> = {};

  for (const contentType of CORE_MEMBERSHIP_TYPES) {
    const source = segmentSource(models, contentType);

    if (source) {
      collections[contentType] = source.collection;
    }
  }

  return applySegmentMembership(collections, data);
};
