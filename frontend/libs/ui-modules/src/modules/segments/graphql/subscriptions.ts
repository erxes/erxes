import gql from 'graphql-tag';

export const SEGMENT_BUILD_CHANGED = gql`
  subscription SegmentBuildChanged($segmentId: String!) {
    segmentBuildChanged(segmentId: $segmentId)
  }
`;
