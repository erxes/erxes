import { gql } from '@apollo/client';

export const LOYALTY_ACCOUNT_TYPE_FIELDS = gql`
  fragment LoyaltyAccountTypeFields on LoyaltyAccountType {
    _id
    name
    ownerType
    frozenBlocks
    tiers {
      key
      name
      order
      deprecated
    }
    reset {
      period
      tierTo
    }
    expiry {
      mode
      months
    }
    pendingDays
    currencyRatio
    pointValue
    earnEligibility {
      who
      segmentId
    }
    fieldId
    status
    campaignCount
    createdAt
  }
`;

export const LOYALTY_ACCOUNT_TYPE_LIST = gql`
  ${LOYALTY_ACCOUNT_TYPE_FIELDS}
  query LoyaltyAccountTypeList($status: String, $ownerType: String) {
    loyaltyAccountTypes(status: $status, ownerType: $ownerType) {
      ...LoyaltyAccountTypeFields
    }
  }
`;

export const LOYALTY_ACCOUNT_TYPE_LEGACY_FIELD_COUNT = gql`
  query LoyaltyAccountTypeLegacyFieldCount {
    loyaltyAccountTypeLegacyFieldCount
  }
`;

export const LOYALTY_PERIOD_RUN_STATUS = gql`
  query LoyaltyPeriodRunStatus {
    loyaltyPeriodRunStatus {
      nextRunAt
      timeZone
      preview {
        releasing
        expiring
        resets {
          accountTypeId
          name
          boundary
          accounts
        }
      }
      runs {
        _id
        startedAt
        finishedAt
        status
        batches
        released
        expired
        reset
        failed
        error
      }
    }
  }
`;

export const LOYALTY_ACCOUNT_TYPE_PERIOD_PREVIEW = gql`
  query LoyaltyAccountTypePeriodPreview(
    $_id: String
    $expiry: LoyaltyAccountTypeExpiryInput
    $reset: LoyaltyAccountTypeResetInput
    $pendingDays: Int
  ) {
    loyaltyAccountTypePeriodPreview(
      _id: $_id
      expiry: $expiry
      reset: $reset
      pendingDays: $pendingDays
    ) {
      timeZone
      nextReset
      noEarnFrom
      earnedNowExpiresAt
      pendingUntil
      tierTo
      impact {
        accounts
        total
        sampled
        pointsCleared
        pointsKept
        tierChanges {
          from
          to
          accounts
        }
      }
    }
  }
`;
