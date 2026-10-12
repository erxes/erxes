import { gql } from '@apollo/client';

export const LOYALTY_BIRTHDAY_VOUCHER_CAMPAIGN = gql`
  query LoyaltyBirthdayVoucherCampaign($_id: String) {
    voucherCampaignDetail(_id: $_id) {
      _id
      title
      perOwnerLimit {
        count
        period
      }
      autoIssue {
        kind
        segmentId
        parts {
          engine
          id
        }
      }
    }
  }
`;

export const LOYALTY_BIRTHDAY_SEGMENTS = gql`
  query LoyaltyBirthdaySegments($contentTypes: [String]!) {
    segments(contentTypes: $contentTypes) {
      _id
      name
      root
      timeSensitive
    }
  }
`;

export const LOYALTY_BIRTHDAY_BROADCAST = gql`
  query LoyaltyBirthdayBroadcast($_id: String) {
    engageMessageDetail(_id: $_id) {
      _id
      title
      nextRunAt
      lastRunAt
      scheduleDate {
        type
      }
    }
  }
`;

export const LOYALTY_BIRTHDAY_AUTOMATION = gql`
  query LoyaltyBirthdayAutomation($_id: String!) {
    automationDetail(_id: $_id) {
      _id
      name
      status
    }
  }
`;
