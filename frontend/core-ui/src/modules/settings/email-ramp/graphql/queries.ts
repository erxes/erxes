import { gql } from '@apollo/client';

const RAMP_FIELDS = `
  tier
  tiers
  dailyBudget
  usedToday
  haltedAt
  haltReason
  lastRate
  lastEvaluatedAt
  advanceRate
  dropRate
  haltRate
  windowDays
`;

export const EMAIL_RAMP_STATUS = gql`
  query EmailRampStatus {
    emailRampStatus {
      ${RAMP_FIELDS}
    }
  }
`;

export const EMAIL_RAMP_RELEASE = gql`
  mutation EmailRampRelease($note: String!) {
    emailRampRelease(note: $note) {
      ${RAMP_FIELDS}
    }
  }
`;
