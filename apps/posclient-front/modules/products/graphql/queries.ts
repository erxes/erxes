import { gql } from "@apollo/client"

const commonFields = `
  _id
  name
  code

`

const productCategories = gql`
  query poscProductCategories ($parentId: String, $searchValue: String, $excludeEmpty: Boolean, $meta: String, $page: Int, $perPage: Int, $sortField: String, $sortDirection: Int) {
    poscProductCategories(parentId: $parentId, searchValue: $searchValue, excludeEmpty: $excludeEmpty, meta: $meta, page: $page, perPage: $perPage, sortField: $sortField, sortDirection: $sortDirection) {
      ${commonFields}
      order
      parentId
      isRoot
    }
  }
`

const getCategoryOrders = gql`
  query categoryOrdersByProduct($ids: [String]) {
    poscProducts(ids: $ids) {
      _id
      category {
        order
      }
    }
  }
`

const products = gql`
  query poscProducts(
    $searchValue: String,
    $type: String, 
    $categoryId: String, 
    $page: Int, 
    $perPage: Int, 
    $isKiosk: Boolean, 
    $groupedSimilarity: String
    $isSimilarity: Boolean
    $ids: [String]
    $minRemainder: Float
    $minDiscountValue: Float
    $maxDiscountValue: Float
    $minDiscountPercent: Float
    $maxDiscountPercent: Float
    $discountConditions: JSON
    $sortField: String
    $sortDirection: Int
    ) {
    poscProducts(
      searchValue: $searchValue, 
      categoryId: $categoryId, 
      type: $type, 
      page: $page, 
      perPage: $perPage, 
      isKiosk: $isKiosk, 
      groupedSimilarity: $groupedSimilarity
      isSimilarity: $isSimilarity
      ids: $ids
      minRemainder: $minRemainder
      minDiscountValue: $minDiscountValue
      maxDiscountValue: $maxDiscountValue
      minDiscountPercent: $minDiscountPercent
      maxDiscountPercent: $maxDiscountPercent
      discountConditions: $discountConditions
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      ${commonFields}
      categoryId
      unitPrice
      type
      description
      remainder
      remainders
      discount(discountConditions: $discountConditions)
      isCheckRem
      hasSimilarity
      attachment {
        url
      }
    }
  }
`

const productSimilarities = gql`
  query PoscProductSimilarities($id: String!, $groupedSimilarity: String) {
    poscProductSimilarities(_id: $id, groupedSimilarity: $groupedSimilarity) {
      products {
        _id
        description
        unitPrice
        name
        remainder
        remainders
        discount
        isCheckRem
        attachment {
          url
        }
        propertiesData
      }
      groups {
        fieldId
        title
      }
    }
  }
`

const productsCount = gql`
  query productsCount(
    $categoryId: String
    $type: String
    $searchValue: String
    $groupedSimilarity: String
    $isSimilarity: Boolean
    $isKiosk: Boolean
    $minRemainder: Float
    $minDiscountValue: Float
    $maxDiscountValue: Float
    $minDiscountPercent: Float
    $maxDiscountPercent: Float
    $discountConditions: JSON
  ) {
    poscProductsTotalCount(
      categoryId: $categoryId
      type: $type
      searchValue: $searchValue
      groupedSimilarity: $groupedSimilarity
      isSimilarity: $isSimilarity
      isKiosk: $isKiosk
      minRemainder: $minRemainder
      minDiscountValue: $minDiscountValue
      maxDiscountValue: $maxDiscountValue
      minDiscountPercent: $minDiscountPercent
      maxDiscountPercent: $maxDiscountPercent
      discountConditions: $discountConditions
    )
  }
`

const productBulkSimilarity = gql`
  query PoscProductBulkSimilarity($id: String!) {
    poscProductBulkSimilarity(_id: $id) {
      _id
      starProductId
      products {
        _id
        name
        code
        description
        unitPrice
        remainder
        remainders
        isCheckRem
        propertiesData
        attachment {
          url
        }
      }
      fields {
        fieldId
        title
        values
      }
    }
  }
`

const getPriceInfo = gql`
  query getPriceInfo($productId: String!) {
    getPriceInfo(productId: $productId)
  }
`

const getInitialCategory = gql`
  query InitialCategory($_id: String) {
    poscProductCategoryDetail(_id: $_id) {
      _id
      name
    }
  }
`

const getKioskCategory = gql`
  query InitialCategory($_id: String) {
    poscProductCategoryDetail(_id: $_id) {
      _id
      name
      attachment {
        url
      }
    }
  }
`

const queries = {
  productCategories,
  products,
  productsCount,
  getPriceInfo,
  getInitialCategory,
  productSimilarities,
  productBulkSimilarity,
  getKioskCategory,
  getCategoryOrders,
}
export default queries
