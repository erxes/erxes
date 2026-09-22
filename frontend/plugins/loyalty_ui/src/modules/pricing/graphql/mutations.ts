import gql from 'graphql-tag';

export const PRICING_FIXED_VALUE_ADD = gql`
  mutation PricingFixedValueAdd(
    $pricingPlanId: String!
    $doc: PricingFixedValueInput!
  ) {
    pricingFixedValueAdd(pricingPlanId: $pricingPlanId, doc: $doc) {
      _id
      pricingPlanId
      productId
      uom
      unitPrice
      newPrice
    }
  }
`;

export const PRICING_FIXED_VALUE_EDIT = gql`
  mutation PricingFixedValueEdit($id: String!, $doc: PricingFixedValueInput!) {
    pricingFixedValueEdit(id: $id, doc: $doc) {
      _id
      pricingPlanId
      productId
      uom
      unitPrice
      newPrice
    }
  }
`;

export const PRICING_FIXED_VALUE_REMOVE = gql`
  mutation PricingFixedValueRemove($id: String!) {
    pricingFixedValueRemove(id: $id) {
      _id
    }
  }
`;

export const PRICING_PLAN_ADD = gql`
  mutation PricingPlanAdd($doc: PricingPlanAddInput) {
    pricingPlanAdd(doc: $doc) {
      _id
      updatedBy
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

export const PRICING_FIXED_VALUES_BULK_EDIT = gql`
  mutation PricingFixedValuesBulkEdit(
    $pricingPlanId: String!
    $productsData: JSON
  ) {
    pricingFixedValuesBulkEdit(
      pricingPlanId: $pricingPlanId
      productsData: $productsData
    )
  }
`;

export const PRICING_PLANS_RECALCULATE_PUBLIC_DISCOUNTS = gql`
  mutation PricingPlansRecalculatePublicDiscounts {
    pricingPlansRecalculatePublicDiscounts
  }
`;
