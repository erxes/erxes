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
