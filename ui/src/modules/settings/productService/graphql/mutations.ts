const productParamsDef = `
  $name: String,
  $type: String,
  $categoryId: String,
  $description: String,
  $sku: String,
  $unitPrice: Float,
  $code: String
  $customFieldsData: JSON,
  $attachment: AttachmentInput,
  $vendorId: String,
`;

const productCategoryParamsDef = `
  $name: String!,
  $code: String!,
  $parentId: String,
  $description: String,
`;

const productParams = `
  name: $name,
  type: $type,
  categoryId: $categoryId,
  description: $description,
  sku: $sku,
  unitPrice: $unitPrice,
  code: $code,
  customFieldsData: $customFieldsData,
  vendorId: $vendorId,
  attachment: $attachment
`;

const productCategoryParams = `
  name: $name,
  code: $code,
  parentId: $parentId,
  description: $description,
`;

const productAdd = `
  mutation productsAdd(${productParamsDef}) {
    productsAdd(${productParams}) {
      _id
    }
  }
`;

const productEdit = `
  mutation productsEdit($_id: String!, ${productParamsDef}) {
    productsEdit(_id: $_id, ${productParams}) {
      _id
    }
  }
`;

const productsRemove = `
  mutation productsRemove($productIds: [String!]) {
    productsRemove(productIds: $productIds)
  }
`;

const productCategoryAdd = `
  mutation productCategoriesAdd(${productCategoryParamsDef}) {
    productCategoriesAdd(${productCategoryParams}) {
      _id
    }
  }
`;

const productCategoryEdit = `
  mutation productCategoriesEdit($_id: String!, ${productCategoryParamsDef}) {
    productCategoriesEdit(_id: $_id, ${productCategoryParams}) {
      _id
    }
  }
`;

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

export default {
  productAdd,
  productEdit,
  productsRemove,
  productCategoryAdd,
  productCategoryEdit,
  productCategoryRemove,
  productsMerge
};
