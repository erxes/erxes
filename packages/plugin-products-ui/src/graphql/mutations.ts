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

// UOM

const commonUomParams = `
  $name: String,
  $code: String
  $isForSubscription:Boolean
  $subscriptionConfig:JSON
`;

const commonUomParamsDef = `
  name: $name,
  code: $code,
  isForSubscription: $isForSubscription,
  subscriptionConfig:$subscriptionConfig
`;

const uomsAdd = `
  mutation uomsAdd(${commonUomParams}) {
    uomsAdd(${commonUomParamsDef}) {
      _id
      name
      code
      createdAt
    }
  }
`;

const uomsEdit = `
  mutation uomsEdit($id: String!,${commonUomParams}) {
    uomsEdit(_id: $id, ${commonUomParamsDef}) {
      _id
      name
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

  uomsAdd,
  uomsEdit,
  uomsRemove,

  productsConfigsUpdate,
};
