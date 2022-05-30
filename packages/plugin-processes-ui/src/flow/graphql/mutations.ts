import { mutations as productMutations } from '@erxes/ui-products/src/graphql';

const productAdd = productMutations.productAdd;

const productEdit = productMutations.productEdit;

const productsRemove = `
  mutation productsRemove($productIds: [String!]) {
    productsRemove(productIds: $productIds)
  }
`;

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

// FLOW

const flowParamsDef = `$name: String, $categoryId: String, $status: String, $jobs: [JobInput]`;
const flowParams = `name: $name, categoryId: $categoryId, status: $status, jobs: $jobs`;

const flowsEdit = `
mutation flowsEdit($id: String!, ${flowParamsDef} ) {
  flowsEdit(_id: $id, ${flowParams} ) {
    _id
  }
}
`;

// JOB

const jobRefersParamsDef = `$code: String, $name: String, $categoryId: String, $type: String, $status: String, $duration: Float, $durationType: String, $needProducts: [JobProductsInput], $resultProducts: [JobProductsInput]`;
const jobRefersParams = `code: $code, name: $name, categoryId: $categoryId, type: $type, status: $status, duration: $duration, durationType: $durationType, needProducts: $needProducts, resultProducts: $resultProducts`;

const jobCategoriesParamsDef = `$name: String!, $code: String!, $description: String, $parentId: String, $status: String`;
const jobCategoriesParams = `name: $name, code: $code, description: $description, parentId: $parentId, status: $status`;

const jobRefersAdd = `
mutation jobRefersAdd(${jobRefersParamsDef}) {
  jobRefersAdd(${jobRefersParams}) {
    _id
  }
}
`;

const jobRefersEdit = `
mutation jobRefersEdit($_id: String!, ${jobRefersParamsDef}) {
  jobRefersEdit(_id: $_id, ${jobRefersParams}) {
    _id
  }
}
`;

const jobRefersRemove = `
mutation jobRefersRemove($jobRefersIds: [String!]) {
  jobRefersRemove(jobRefersIds: $jobRefersIds)
}
`;

const jobCategoriesAdd = `
mutation jobCategoriesAdd(${jobCategoriesParamsDef}) {
  jobCategoriesAdd(${jobCategoriesParams}) {
    _id
  }
}
`;

const jobCategoriesEdit = `
mutation jobCategoriesEdit($_id: String!, ${jobCategoriesParamsDef}) {
  jobCategoriesEdit(_id: $_id, ${jobCategoriesParams}) {
    _id
  }
}
`;

const jobCategoriesRemove = `
mutation jobCategoriesRemove($_id: String!) {
  jobCategoriesRemove(_id: $_id)
}
`;

// UOM

const uomsAdd = `
  mutation uomsAdd($name: String, $code: String) {
    uomsAdd(name: $name, code: $code) {
      _id
      name
      code
      createdAt
    }
  }
`;

const uomsEdit = `
  mutation uomsEdit($id: String!, $name: String, $code: String) {
    uomsEdit(_id: $id, name: $name, code: $code) {
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

const productsConfigsUpdate = `
  mutation productsConfigsUpdate($configsMap: JSON!) {
    productsConfigsUpdate(configsMap: $configsMap)
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

  uomsAdd,
  uomsEdit,
  uomsRemove,

  jobRefersAdd,
  jobRefersEdit,
  jobRefersRemove,
  jobCategoriesAdd,
  jobCategoriesEdit,
  jobCategoriesRemove,

  flowsEdit,

  productsConfigsUpdate
};
