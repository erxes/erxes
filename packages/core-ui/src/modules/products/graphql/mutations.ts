import { mutations as productMutations } from "@erxes/ui-products/src/graphql";

const productAdd = productMutations.productAdd;

const productEdit = productMutations.productEdit;

const productsRemove = productMutations.productsRemove;

const productCategoryAdd = productMutations.productCategoryAdd;
const productCategoryEdit = productMutations.productCategoryEdit;

const productCategoryRemove = `
  mutation productCategoriesRemove($_id: String!) {
    productCategoriesRemove(_id: $_id)
  }
`;

const productsMerge = `
  mutation productsMerge($productIds: [String], $productFields: JSON) {
    productsMerge(productIds: $productIds, productFields: $productFields) {
      _id
    }
  }
`;

const productsDuplicate = `
  mutation productsDuplicate($_id: String!) {
    productsDuplicate(_id: $_id) {
      _id
    }
  }
`;

// UOM

const commonUomParams = `
  $name: String,
  $code: String
  $isForSubscription:Boolean
  $subscriptionConfig:JSON
  $timely: TimelyType
`;

const commonUomParamsDef = `
  name: $name,
  code: $code,
  isForSubscription: $isForSubscription,
  subscriptionConfig: $subscriptionConfig,
  timely: $timely
`;

const uomsAdd = `
  mutation uomsAdd(${commonUomParams}) {
    uomsAdd(${commonUomParamsDef}) {
      _id
      name
      timely
      code
      createdAt
    }
  }
`;

const uomsEdit = `
  mutation uomsEdit($_id: String!,${commonUomParams}) {
    uomsEdit(_id: $_id, ${commonUomParamsDef}) {
      _id
      name
      timely
      code
      createdAt
    }
  }
`;

const uomsRemove = `
  mutation uomsRemove($uomIds: [String!]) {
    uomsRemove(uomIds: $uomIds)
  }
`;

const bundleConditionAdd = `
  mutation BundleConditionAdd($name: String!, $description: String, $code: String) {
    bundleConditionAdd(name: $name, description: $description, code: $code) {
      name
      description
      _id
      code
      createdAt
      userId
    } 
  }
`;
const bundleConditionSetBulk = `
  mutation BundleConditionSetBulk($productIds: [String], $bundleId: String!) {
    bundleConditionSetBulk(productIds: $productIds, bundleId: $bundleId)
  }
`;
const bundleConditionRemove = `
mutation BundleConditionRemove($id: String!) {
  bundleConditionRemove(_id: $id)
}
`;
const bundleConditionDefault = `
mutation BundleConditionDefault($id: String!) {
  bundleConditionDefault(_id: $id)
}
`;

const bundleConditionEdit = `
mutation BundleConditionEdit($id: String!, $description: String, $code: String, $name: String!) {
  bundleConditionEdit(_id: $id, description: $description, code: $code, name: $name) {
    _id
  }
}`;

const bundleRuleAdd = `
mutation BundleRulesAdd($name: String!, $description: String, $code: String, $rules: [BundleRuleItemInput]) {
  bundleRulesAdd(name: $name, description: $description, code: $code, rules: $rules) {
    _id
  }
}
`;
const bundleRuleRemove = `
mutation BundleRulesRemove($id: String!) {
  bundleRulesRemove(_id: $id)
}
`;
const bundleRuleEdit = `
mutation BundleRulesEdit($_id: String!, $description: String, $code: String, $rules: [BundleRuleItemInput], $name: String!) {
  bundleRulesEdit(_id: $_id, description: $description, code: $code, rules: $rules, name: $name) {
    _id
  }
}`;
const productsConfigsUpdate = productMutations.productsConfigsUpdate;

// product rules
const productRuleParamDefs = `
  $name: String!,
  $unitPrice: Float!,
  $bundleId: String,
  $categoryIds: [String],
  $excludeCategoryIds: [String],
  $productIds: [String],
  $excludeProductIds: [String],
  $tagIds: [String],
  $excludeTagIds: [String]
`;

const productRuleParams = `
  name: $name,
  unitPrice: $unitPrice,
  bundleId: $bundleId,
  categoryIds: $categoryIds,
  excludeCategoryIds: $excludeCategoryIds,
  productIds: $productIds,
  excludeProductIds: $excludeProductIds,
  tagIds: $tagIds,
  excludeTagIds: $excludeTagIds
`;

const productRulesAdd = `
  mutation productRulesAdd(${productRuleParamDefs}) {
    productRulesAdd(${productRuleParams}) {
      _id
    }
  }
`;

const productRulesEdit = `
  mutation productRulesEdit($_id: String!, ${productRuleParamDefs}) {
    productRulesEdit(_id: $_id, ${productRuleParams}) {
      _id
    }
  }
`;

const productRulesRemove = `
  mutation productRulesRemove($_id: String!) {
    productRulesRemove(_id: $_id)
  }
`;

export default {
  productAdd,
  productEdit,
  productsRemove,
  productCategoryAdd,
  productCategoryEdit,
  productCategoryRemove,
  productsMerge,
  productsDuplicate,
  uomsAdd,
  uomsEdit,
  uomsRemove,

  productsConfigsUpdate,
  bundleConditionAdd,
  bundleConditionRemove,
  bundleConditionEdit,
  bundleConditionDefault,

  bundleRuleAdd,
  bundleRuleRemove,
  bundleRuleEdit,
  bundleConditionSetBulk,

  productRulesAdd,
  productRulesEdit,
  productRulesRemove
};
