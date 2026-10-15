import { gql } from '~/gql';

export const LOYALTY_SOURCE_SEGMENT_ADD = gql(`
  mutation LoyaltySourceSegmentAdd(
    $contentType: String!
    $ownedBy: String
    $root: JSON!
  ) {
    segmentsAdd(contentType: $contentType, ownedBy: $ownedBy, root: $root) {
      _id
    }
  }
`);

export const LOYALTY_SOURCE_SEGMENTS_REMOVE = gql(`
  mutation LoyaltySourceSegmentsRemove($ids: [String!]!) {
    segmentsRemove(ids: $ids)
  }
`);
