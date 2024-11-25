import { mutations as productMutations } from '@erxes/ui-products/src/graphql';

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

// Settings

const productsConfigsUpdate = productMutations.productsConfigsUpdate;

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
};
