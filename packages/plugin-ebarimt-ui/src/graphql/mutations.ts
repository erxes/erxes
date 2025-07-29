// Settings

import { ebarimtProductGroupFields, ebarimtProductRuleFields, responseFields } from "./queries";

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

const mutationGroupParamsDef = `
  $mainProductId: String
  $subProductId: String
  $sortNum: Float
  $ratio: Float
  $isActive: Boolean
`;

const mutationGroupParamsVal = `
  mainProductId: $mainProductId
  subProductId: $subProductId
  sortNum: $sortNum
  ratio: $ratio
  isActive: $isActive
`;

const ebarimtProductGroupCreate = `
  mutation ebarimtProductGroupCreate(${mutationGroupParamsDef}) {
    ebarimtProductGroupCreate(${mutationGroupParamsVal}) {
      ${ebarimtProductGroupFields}
    }
  }
`;

const ebarimtProductGroupUpdate = `
  mutation ebarimtProductGroupUpdate($_id: String!, ${mutationGroupParamsDef}) {
    ebarimtProductGroupUpdate(_id: $_id, ${mutationGroupParamsVal}) {
      ${ebarimtProductGroupFields}
    }
  }
`;

const ebarimtProductGroupsRemove = `
  mutation ebarimtProductGroupsRemove($ids: [String]) {
    ebarimtProductGroupsRemove(ids: $ids)
  }
`;

export default {
  updateConfigs,
  putResponseReturnBill,
  putResponseReReturn,
  ebarimtProductRuleCreate,
  ebarimtProductRuleUpdate,
  ebarimtProductRulesRemove,
  ebarimtProductGroupCreate,
  ebarimtProductGroupUpdate,
  ebarimtProductGroupsRemove,
};
