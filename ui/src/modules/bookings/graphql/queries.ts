const styleFields = `
  itemShape
  widgetColor

  productAvailable
  productUnavailable
  productSelected

  textAvailable
  textUnavailable
  textSelected
`;

const displayBlockFields = `
  shape
  columns
  rows
  margin
`;

const formFields = `
  _id
  title
  code
  description
  type
  buttonText
  numberOfPages
  createdDate
  createdUserId
  createdUser {
    _id
    details {
      avatar
      fullName
      position
    }
  }

`;

const productCategoryFields = `
  _id
  name
  order
  code
  parentId
  description
  status
  
  attachment {
    name
    url
    type
    size
  }

  isRoot
  productCount
`;

const userFields = `
  _id

  details {
    avatar
    fullName
    position
  }
`;

const bookingFields = `
  _id
  name

  image {
    name
    url
    type
    size
  }

  tagIds

  tags {
    _id
    name
  }

  description
  createdDate
  viewCount

  userFilters
  
  brand {
    _id
    name
  }

  createdUser {
    ${userFields}
  }
  
  title
  brandId
  channelIds
  languageCode
  formId
  buttonText

  productCategoryId

  isActive

  styles {
    ${styleFields}
  }

  mainProductCategory {
    ${productCategoryFields}
  }

  displayBlock {
    ${displayBlockFields}
  }

  form {
    ${formFields}
  }

  leadData
`;

const queryParamsDef = `
  $page: Int
  $perPage: Int
  $brandId: String
  $tagId: String
  $status: String
`;
const queryParamsVal = `
  page: $page
  perPage: $perPage
  brandId: $brandId
  tagId: $tagId
  status: $status
`;

const bookingDetail = `
  query bookingDetail($_id: String!) {
    bookingDetail(_id: $_id) {
      ${bookingFields}  
    }
  }
`;

const bookings = `
  query bookings(${queryParamsDef}) {
    bookings(${queryParamsVal}) {
      ${bookingFields}
    }
  }
`;

const productCategories = `
  query productCategories($parentId: String, $searchValue: String) {
    productCategories(parentId: $parentId, searchValue: $searchValue) {
      _id
      name
      isRoot
    }
  }
`;

const bookingsTotalCount = `
  query bookingsTotalCount($channelId: String, $brandId: String, $tagId: String, $searchValue: String, $status: String){
    bookingsTotalCount(channelId: $channelId, brandId: $brandId, tagId: $tagId, searchValue: $searchValue, status: $status){
      total
      byTag
      byChannel
      byBrand
      byStatus
    }
  }
`;

const fieldsGroups = `
  query fieldsGroups($contentType: String!) {
    fieldsGroups(contentType: $contentType) {
      _id
      name

      fields {
        _id
        text
      }
    }
  }
`;

export default {
  bookingDetail,
  bookings,
  productCategories,
  bookingsTotalCount,
  fieldsGroups
};
