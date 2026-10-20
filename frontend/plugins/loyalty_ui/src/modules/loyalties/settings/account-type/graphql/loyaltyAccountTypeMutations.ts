import { gql } from '~/gql';

export const LOYALTY_ACCOUNT_TYPE_ADD = gql(`
  mutation LoyaltyAccountTypeAdd(
    $name: String!
    $ownerType: String!
    $frozenBlocks: String
    $tiers: [LoyaltyTierInput]
    $reset: LoyaltyAccountTypeResetInput
    $expiry: LoyaltyAccountTypeExpiryInput
    $pendingDays: Int
    $currencyRatio: Float
    $pointValue: Float
    $earnEligibility: LoyaltyEarnEligibilityInput
  ) {
    loyaltyAccountTypeAdd(
      name: $name
      ownerType: $ownerType
      frozenBlocks: $frozenBlocks
      tiers: $tiers
      reset: $reset
      expiry: $expiry
      pendingDays: $pendingDays
      currencyRatio: $currencyRatio
      pointValue: $pointValue
      earnEligibility: $earnEligibility
    ) {
      ...LoyaltyAccountTypeFields
    }
  }
`);

export const LOYALTY_ACCOUNT_TYPE_EDIT = gql(`
  mutation LoyaltyAccountTypeEdit(
    $_id: String!
    $name: String!
    $frozenBlocks: String
    $tiers: [LoyaltyTierInput]
    $reset: LoyaltyAccountTypeResetInput
    $expiry: LoyaltyAccountTypeExpiryInput
    $pendingDays: Int
    $currencyRatio: Float
    $pointValue: Float
    $earnEligibility: LoyaltyEarnEligibilityInput
  ) {
    loyaltyAccountTypeEdit(
      _id: $_id
      name: $name
      frozenBlocks: $frozenBlocks
      tiers: $tiers
      reset: $reset
      expiry: $expiry
      pendingDays: $pendingDays
      currencyRatio: $currencyRatio
      pointValue: $pointValue
      earnEligibility: $earnEligibility
    ) {
      ...LoyaltyAccountTypeFields
    }
  }
`);

export const LOYALTY_ACCOUNT_TYPE_ARCHIVE = gql(`
  mutation LoyaltyAccountTypeArchive($_id: String!) {
    loyaltyAccountTypeArchive(_id: $_id) {
      ...LoyaltyAccountTypeFields
    }
  }
`);

export const LOYALTY_ACCOUNT_TYPE_UNARCHIVE = gql(`
  mutation LoyaltyAccountTypeUnarchive($_id: String!) {
    loyaltyAccountTypeUnarchive(_id: $_id) {
      ...LoyaltyAccountTypeFields
    }
  }
`);

export const LOYALTY_ACCOUNTS_ADOPT_CAMPAIGN_FIELDS = gql(`
  mutation LoyaltyAccountTypesAdoptCampaignFields {
    loyaltyAccountTypesAdoptCampaignFields {
      adopted {
        accountTypeId
        name
        campaigns
      }
      skipped {
        fieldId
        reason
      }
    }
  }
`);
