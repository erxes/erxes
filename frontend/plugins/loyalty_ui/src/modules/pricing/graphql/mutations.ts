import gql from 'graphql-tag';

export const PRICING_PLAN_ADD = gql`
  mutation PricingPlanAdd($doc: PricingPlanAddInput) {
    pricingPlanAdd(doc: $doc) {
      _id
    }
  }
`;

export const PRICING_PLAN_REMOVE = gql`
  mutation PricingPlanRemove($pricingPlanRemoveId: String) {
    pricingPlanRemove(id: $pricingPlanRemoveId) {
      _id
    }
  }
`;

export const PRICING_PLAN_EDIT = gql`
  mutation PricingPlanEdit($doc: PricingPlanEditInput) {
    pricingPlanEdit(doc: $doc) {
      _id
    }
  }
`;
