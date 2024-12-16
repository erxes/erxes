// Settings

import { ebarimtProductRuleFields, responseFields } from "./queries";

const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

const putResponseReturnBill = `
  mutation putResponseReturnBill($_id: String!) {
    putResponseReturnBill(_id: $_id) {
      ${responseFields}
    }
  }
`;

const putResponseReReturn = `
  mutation putResponseReReturn($_id: String!) {
    putResponseReReturn(_id: $_id) {
      ${responseFields}
    }
  }
`;

const mutationParamsDef = `
  $title: String
  $productIds: [String]
  $productCategoryIds: [String]
  $excludeCategoryIds: [String]
  $excludeProductIds: [String]
  $tagIds: [String]
  $excludeTagIds: [String]
  $kind: String
  $taxType: String
  $taxCode: String
  $taxPercent: Float
`;

const mutationParamsVal = `
  title: $title
  productIds: $productIds
  productCategoryIds: $productCategoryIds
  excludeCategoryIds: $excludeCategoryIds
  excludeProductIds: $excludeProductIds
  tagIds: $tagIds
  excludeTagIds: $excludeTagIds
  kind: $kind
  taxType: $taxType
  taxCode: $taxCode
  taxPercent: $taxPercent
`;

const ebarimtProductRuleCreate = `
  mutation ebarimtProductRuleCreate(${mutationParamsDef}) {
    ebarimtProductRuleCreate(${mutationParamsVal}) {
      ${ebarimtProductRuleFields}
    }
  }
`;

const ebarimtProductRuleUpdate = `
  mutation ebarimtProductRuleUpdate($_id: String!, ${mutationParamsDef}) {
    ebarimtProductRuleUpdate(_id: $_id, ${mutationParamsVal}) {
      ${ebarimtProductRuleFields}
    }
  }
`;

const ebarimtProductRulesRemove = `
  mutation ebarimtProductRulesRemove($ids: [String]) {
    ebarimtProductRulesRemove(ids: $ids)
  }
`;

export default {
  updateConfigs,
  putResponseReturnBill,
  putResponseReReturn,
  ebarimtProductRuleCreate,
  ebarimtProductRuleUpdate,
  ebarimtProductRulesRemove,
};
