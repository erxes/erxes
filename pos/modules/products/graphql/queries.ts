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

const products = gql`
  query poscProducts($searchValue: String, $type: String, $categoryId: String, $page: Int, $perPage: Int, $groupedSimilarity: String) {
    poscProducts(searchValue: $searchValue, categoryId: $categoryId, type: $type, page: $page, perPage: $perPage, groupedSimilarity: $groupedSimilarity) {
      ${commonFields}
      categoryId
      unitPrice
      type
      description
      remainder
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
        ${commonFields}
        categoryId
        unitPrice
        type
        description
        remainder
        hasSimilarity
        attachment {
          url
        }
        hasSimilarity
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
  ) {
    poscProductsTotalCount(
      categoryId: $categoryId
      type: $type
      searchValue: $searchValue
      groupedSimilarity: $groupedSimilarity
    )
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

const queries = {
  productCategories,
  products,
  productsCount,
  getPriceInfo,
  getInitialCategory,
  productSimilarities,
}
export default queries
