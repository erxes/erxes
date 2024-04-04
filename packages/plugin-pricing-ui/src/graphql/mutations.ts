import { commonFields } from './queries';

const pricingPlanAdd = `
  mutation PricingPlanAdd($doc: PricingPlanAddInput) {
    pricingPlanAdd(doc: $doc) {
      ${commonFields}

      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const pricingPlanEdit = `
  mutation PricingPlanEdit($doc: PricingPlanEditInput) {
    pricingPlanEdit(doc: $doc) {
      _id
      ${commonFields}

      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const pricingPlanRemove = `
  mutation PricingPlanRemove($id: String) {
    pricingPlanRemove(id: $id) {
      _id
    }
  }
`;

export default {
  pricingPlanAdd,
  pricingPlanEdit,
  pricingPlanRemove
};
