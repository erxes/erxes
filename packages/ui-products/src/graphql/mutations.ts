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

export default {
  productAdd,
  productEdit,
  productCategoryAdd,
  productCategoryEdit
};
