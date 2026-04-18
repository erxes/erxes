import { gql } from '@apollo/client';

export const AGENTS_ADD_MUTATION = gql`
  mutation AgentsAdd(
    $number: String!
    $status: AgentStatus!
    $customerIds: [String]
    $companyIds: [String]
    $hasReturn: Boolean!
    $returnAmount: Float
    $returnPercent: Float
    $prepaidPercent: Float
    $discountPercent: Float
    $startDate: Date
    $endDate: Date
    $startMonth: Date
    $endMonth: Date
    $startDay: Date
    $endDay: Date
    $productRuleIds: [String]
  ) {
    agentsAdd(
      number: $number
      status: $status
      customerIds: $customerIds
      companyIds: $companyIds
      hasReturn: $hasReturn
      returnAmount: $returnAmount
      returnPercent: $returnPercent
      prepaidPercent: $prepaidPercent
      discountPercent: $discountPercent
      startDate: $startDate
      endDate: $endDate
      startMonth: $startMonth
      endMonth: $endMonth
      startDay: $startDay
      endDay: $endDay
      productRuleIds: $productRuleIds
    ) {
      _id
      number
      status
      hasReturn
      returnAmount
      returnPercent
      prepaidPercent
      discountPercent
      startDate
      endDate
      startMonth
      endMonth
      startDay
      endDay
      customerIds
      companyIds
      productRuleIds
      rulesOfProducts
    }
  }
`;

export const AGENTS_EDIT_MUTATION = gql`
  mutation AgentsEdit(
    $_id: String!
    $number: String!
    $status: AgentStatus!
    $customerIds: [String]
    $companyIds: [String]
    $hasReturn: Boolean!
    $returnAmount: Float
    $returnPercent: Float
    $prepaidPercent: Float
    $discountPercent: Float
    $startDate: Date
    $endDate: Date
    $startMonth: Date
    $endMonth: Date
    $startDay: Date
    $endDay: Date
    $productRuleIds: [String]
  ) {
    agentsEdit(
      _id: $_id
      number: $number
      status: $status
      customerIds: $customerIds
      companyIds: $companyIds
      hasReturn: $hasReturn
      returnAmount: $returnAmount
      returnPercent: $returnPercent
      prepaidPercent: $prepaidPercent
      discountPercent: $discountPercent
      startDate: $startDate
      endDate: $endDate
      startMonth: $startMonth
      endMonth: $endMonth
      startDay: $startDay
      endDay: $endDay
      productRuleIds: $productRuleIds
    ) {
      _id
      number
      status
      hasReturn
      returnAmount
      returnPercent
      prepaidPercent
      discountPercent
      startDate
      endDate
      startMonth
      endMonth
      startDay
      endDay
      customerIds
      companyIds
      productRuleIds
      rulesOfProducts
    }
  }
`;

export const DELETE_AGENT_MUTATION = gql`
  mutation AgentsRemove($_id: String!) {
    agentsRemove(_id: $_id) {
      _id
    }
  }
`;
