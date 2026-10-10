import { gql } from '@apollo/client';

export const LOYALTY_BIRTHDAY_BROADCAST_ADD = gql`
  mutation LoyaltyBirthdayBroadcastAdd(
    $title: String
    $targetIds: [String]
    $workflow: JSON
  ) {
    engageMessageAdd(
      title: $title
      kind: "manual"
      method: "workflow"
      targetType: "segment"
      targetIds: $targetIds
      isDraft: true
      isLive: false
      workflow: $workflow
    ) {
      _id
    }
  }
`;

export const LOYALTY_BIRTHDAY_BROADCAST_FOLLOW = gql`
  mutation LoyaltyBirthdayBroadcastFollow(
    $_id: String!
    $afterSegment: EngageAfterSegmentInput
  ) {
    engageMessageSetSchedule(_id: $_id, afterSegment: $afterSegment) {
      _id
      nextRunAt
      scheduleDate {
        type
      }
    }
  }
`;

export const LOYALTY_BIRTHDAY_BROADCAST_UNFOLLOW = gql`
  mutation LoyaltyBirthdayBroadcastUnfollow($_id: String!) {
    engageMessageCancelSchedule(_id: $_id) {
      _id
      nextRunAt
      scheduleDate {
        type
      }
    }
  }
`;

export const LOYALTY_BIRTHDAY_BROADCAST_REMOVE = gql`
  mutation LoyaltyBirthdayBroadcastRemove($_ids: [String]) {
    engageMessageRemove(_ids: $_ids)
  }
`;

export const LOYALTY_BIRTHDAY_AUTOMATION_ADD = gql`
  mutation LoyaltyBirthdayAutomationAdd(
    $name: String
    $status: String
    $triggers: [TriggerInput]
    $actions: [ActionInput]
  ) {
    automationsAdd(
      name: $name
      status: $status
      triggers: $triggers
      actions: $actions
    ) {
      _id
    }
  }
`;

// Returning the status updates the cached automation.
export const LOYALTY_BIRTHDAY_AUTOMATION_SET_STATUS = gql`
  mutation LoyaltyBirthdayAutomationSetStatus($_id: String, $status: String) {
    automationsEdit(_id: $_id, status: $status) {
      _id
      status
    }
  }
`;

export const LOYALTY_BIRTHDAY_AUTOMATION_REMOVE = gql`
  mutation LoyaltyBirthdayAutomationRemove($automationIds: [String]) {
    automationsRemove(automationIds: $automationIds)
  }
`;

export const LOYALTY_BIRTHDAY_REWARD_SET = gql`
  mutation LoyaltyBirthdayRewardSet(
    $_id: String!
    $kind: String!
    $segmentId: String!
    $parts: [VoucherAutoIssuePartInput!]!
  ) {
    voucherCampaignSetAutoIssue(
      _id: $_id
      kind: $kind
      segmentId: $segmentId
      parts: $parts
    ) {
      _id
    }
  }
`;

export const LOYALTY_BIRTHDAY_REWARD_REMOVE = gql`
  mutation LoyaltyBirthdayRewardRemove($_id: String!, $kind: String!) {
    voucherCampaignRemoveAutoIssue(_id: $_id, kind: $kind) {
      _id
    }
  }
`;
