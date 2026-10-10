import { gql } from '@apollo/client';

const LOYALTY_RULE_FIELDS = `
  _id
  type
  scoreCampaignId
  boardId
  pipelineId
  earn {
    probability
    stageIds
  }
  refund {
    probability
    stageIds
  }
`;

export const SALES_LOYALTY_RULES = gql`
  query SalesLoyaltyRules {
    salesLoyaltyRules {
      ${LOYALTY_RULE_FIELDS}
    }
  }
`;

export const SALES_LOYALTY_RULES_SAVE = gql`
  mutation SalesLoyaltyRulesSave($rules: [SalesLoyaltyRuleInput!]!) {
    salesLoyaltyRulesSave(rules: $rules) {
      ${LOYALTY_RULE_FIELDS}
    }
  }
`;

// Deal automations that already give points; the same campaign in both
// would have two writers arguing over one entry.
export const SALES_LOYALTY_RULE_AUTOMATIONS = gql`
  query SalesLoyaltyRuleAutomations(
    $triggerTypes: [String]
    $actionTypes: [String]
  ) {
    automations(triggerTypes: $triggerTypes, actionTypes: $actionTypes) {
      _id
      name
      status
      triggers {
        id
        type
        config
      }
      actions {
        id
        type
        config
      }
    }
  }
`;

// Asked only by the pipeline editor; board views never pay for it.
export const SALES_STAGE_LOYALTY_POINTS = gql`
  query SalesStageLoyaltyPoints($pipelineId: String!) {
    salesStages(pipelineId: $pipelineId, isAll: true) {
      _id
      loyaltyPoints {
        earns {
          campaignId
          ruleType
        }
        refunds
        tier {
          accountTypeId
          ruleType
        }
      }
    }
  }
`;

// Only an active campaign gives points; the dialog warns about the rest.
export const SALES_SCORE_CAMPAIGN_OPTIONS = gql`
  query SalesScoreCampaignOptions {
    scoreCampaigns(limit: 100) {
      list {
        _id
        title
        status
      }
    }
  }
`;

const LOYALTY_TIER_RULE_FIELDS = `
  _id
  type
  accountTypeId
  bands {
    tier
    min
    max
  }
  onlyUpgrade
  boardId
  pipelineId
  earn {
    probability
    stageIds
  }
`;

export const SALES_LOYALTY_TIER_RULES = gql`
  query SalesLoyaltyTierRules {
    salesLoyaltyTierRules {
      ${LOYALTY_TIER_RULE_FIELDS}
    }
  }
`;

export const SALES_LOYALTY_TIER_RULES_SAVE = gql`
  mutation SalesLoyaltyTierRulesSave($rules: [SalesLoyaltyTierRuleInput!]!) {
    salesLoyaltyTierRulesSave(rules: $rules) {
      ${LOYALTY_TIER_RULE_FIELDS}
    }
  }
`;

// Deals and POS orders belong to customers, so only their wallets with tiers.
export const SALES_LOYALTY_TIER_WALLETS = gql`
  query SalesLoyaltyTierWallets {
    loyaltyAccountTypes(status: "active", ownerType: "customer") {
      _id
      name
      tiers {
        key
        name
        order
        deprecated
      }
    }
  }
`;

// Net points each listed deal moved, asked of loyalty for the loaded page.
export const SALES_DEAL_LOYALTY_TOTALS = gql`
  query SalesDealLoyaltyTotals($targetIds: [String!]!) {
    loyaltyScoreTargetTotals(targetIds: $targetIds) {
      targetId
      total
    }
  }
`;
