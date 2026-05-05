import { gql } from "@apollo/client"

const qrSlot = gql`
  query QrSlot {
    poscSlots {
      _id
      code
      name
      posToken
      option
    }
  }
`

const qrCategories = gql`
  query QrCategories {
    poscProductCategories {
      _id
      name
      code
      order
      parentId
      isRoot
    }
  }
`

const qrProducts = gql`
  query QrProducts($categoryId: String, $searchValue: String) {
    poscProducts(
      categoryId: $categoryId
      searchValue: $searchValue
      perPage: 200
    ) {
      _id
      name
      code
      categoryId
      unitPrice
      type
      description
      attachment {
        url
      }
    }
  }
`

const queries = { qrSlot, qrCategories, qrProducts }
export default queries
