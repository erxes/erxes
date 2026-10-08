import { gql } from '@apollo/client';

// The campaigns sent to this segment's members, nightly ones included.
export const SEGMENT_BROADCASTS = gql`
  query SegmentBroadcasts($segmentId: String, $limit: Int) {
    engageMessages(segmentId: $segmentId, limit: $limit) {
      list {
        _id
        title
        isLive
        isDraft
        scheduleDate {
          type
        }
      }
    }
  }
`;
