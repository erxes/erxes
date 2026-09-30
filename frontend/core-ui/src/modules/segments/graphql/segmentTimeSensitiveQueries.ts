import { gql } from '@apollo/client';

export const SEGMENT_TIME_SENSITIVE = gql`
  query SegmentTimeSensitive($_id: String!) {
    segmentDetail(_id: $_id) {
      _id
      timeSensitive
    }
  }
`;
