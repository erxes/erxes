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
  $attachmentMore: [AttachmentInput],
  $supply: String,
  $productCount: Int,
  $minimiumCount: Int,
  $vendorId: String,
  $uomId: String,
  $subUoms: JSON,
`;

const productCategoryParamsDef = `
  $name: String!,
  $code: String!,
  $parentId: String,
  $description: String,
  $attachment: AttachmentInput,
  $status: String,
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
  attachment: $attachment,
  attachmentMore: $attachmentMore,
  supply: $supply,
  productCount: $productCount,
  minimiumCount: $minimiumCount,
  vendorId: $vendorId,
  uomId: $uomId,
  subUoms: $subUoms
`;

const productCategoryParams = `
  name: $name,
  code: $code,
  parentId: $parentId,
  description: $description,
  attachment: $attachment,
  status: $status,
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

const productsRemove = `
  mutation productsRemove($productIds: [String!]) {
    productsRemove(productIds: $productIds)
  }
`;

const productsConfigsUpdate = `
  mutation productsConfigsUpdate($configsMap: JSON!) {
    productsConfigsUpdate(configsMap: $configsMap)
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

export default {
  productAdd,
  productEdit,
  productsRemove,
  productCategoryAdd,
  productCategoryEdit,
  productsConfigsUpdate,
  uomsAdd,
  uomsEdit,
  uomsRemove
};
