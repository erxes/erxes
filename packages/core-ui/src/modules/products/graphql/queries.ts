import { queries as productQueries } from "@erxes/ui-products/src/graphql";

const productCategories = productQueries.productCategories;

const products = productQueries.products;

const productCountByTags = `
  query productCountByTags {
    productCountByTags
  }
`;

const productCategoriesCount = `
  query productCategoriesTotalCount {
    productCategoriesTotalCount
  }
`;

const productsGroupCounts = `
  query productsGroupCounts(
    $segment: String,
    $segmentData: String,
    $only: String
  ) {
    productsGroupCounts(
      segment: $segment,
      segmentData: $segmentData,
      only: $only
    )
  }
`;

const productsCount = `
  query productsTotalCount(
    $type: String,
    $categoryId: String,
    $status: String,
    $tag: String,
    $searchValue: String,
    $vendorId: String,
    $brand: String,
    $ids: [String],
    $excludeIds: Boolean,
    $pipelineId: String,
    $boardId: String,
    $segment: String,
    $segmentData: String,
    $image: String,
  ) {
    productsTotalCount(
      type: $type,
      categoryId: $categoryId,
      tag: $tag,
      searchValue: $searchValue,
      status: $status,
      vendorId: $vendorId,
      brand: $brand,
      ids: $ids,
      excludeIds: $excludeIds,
      pipelineId: $pipelineId,
      boardId: $boardId,
      segment: $segment,
      segmentData: $segmentData,
      image: $image,
    )
  }
`;

const productDetail = productQueries.productDetail;

const productCategoryDetail = `
  query productCategoryDetail($_id: String) {
    productCategoryDetail(_id: $_id) {
      _id
      code
      name
      productCount
    }
  }
`;

// UOM

const uoms = productQueries.uoms;

const uomsTotalCount = productQueries.uomsTotalCount;

// Settings

const productsConfigs = productQueries.productsConfigs;

// product documents
const documents = `
  query documents($page: Int, $perPage: Int, $contentType: String) {
    documents(page: $page, perPage: $perPage, contentType: $contentType) {
      _id
      contentType
      name
      createdAt
    }
  }
`;
const bundleConditions = `
 query bundleConditions($searchValue: String, $perPage: Int, $page: Int){
  bundleConditions(searchValue: $searchValue, perPage: $perPage, page: $page) {
    _id
    userId
    name
    description
    createdAt
    code
    isDefault
  }
}
`;

const bundleConditionDetail = `
query BundleConditionDetail($id: String!) {
  bundleConditionDetail(_id: $id) {
    userId
    name
    description
    createdAt
    code
    _id
  }
}
`;

const bundleConditionTotalCount = `
query bundleConditionTotalCount{
  bundleConditionTotalCount
}
`;
const bundleRules = `
query BundleRules {
  bundleRules {
    userId
    name
    description
    createdAt
    code
    _id
    rules {
      quantity
      productIds
      products {
        _id
        name
      }
      priceValue
      priceType
      priceAdjustType
      priceAdjustFactor
      percent
      code
      allowSkip
    }
  }
}`;

const productRules = `
  query productRules {
    productRules {
      _id
      name
      categoryIds
      excludeCategoryIds
      productIds
      excludeProductIds
      tagIds
      excludeTagIds
      unitPrice
      bundleId

      categories {
        name
      }
      excludeCategories {
        name
      }
      products {
        name
      }
      excludeProducts {
        name
      }
      tags {
        name
      }
      excludeTags {
        name
      }
    }
  }
`;


export default {
  products,
  productDetail,
  productsCount,
  productsGroupCounts,
  productCountByTags,
  productCategories,
  productCategoriesCount,
  productCategoryDetail,
  uoms,
  uomsTotalCount,
  productsConfigs,
  documents,
  bundleConditions,
  bundleConditionDetail,
  bundleConditionTotalCount,
  bundleRules,
  productRules
};
