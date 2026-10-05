import { gql } from '@apollo/client';

export const SEGMENT_MEMBERSHIP_AUTOMATIONS = gql`
  query SegmentMembershipAutomations($triggerSegmentId: String) {
    automations(triggerSegmentId: $triggerSegmentId) {
      _id
      name
      status
    }
  }
`;
