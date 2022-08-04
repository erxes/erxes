const bookingFields = `
  name
  image {
    name
    type
    url
    size
  }

  viewCount
  
  navigationText
  bookingFormText

  description
  userFilters
  productCategoryId

  style
  displayBlock
  productFieldIds

  
  mainProductCategory {
    _id
  }
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

const productCategories = `
  query productCategories($parentId: String, $searchValue: String) {
    productCategories(parentId: $parentId, searchValue: $searchValue) {
      _id
      name
      isRoot
    }
  }
`;

export const commonFields = `
  brandId
  name
  kind
  code
  tagIds
  isActive
  leadData
  languageCode

  formId

  brand {
    _id
    name
    code
  }

  channels {
    _id
    name
  }

  bookingData {
    ${bookingFields}
  }

  tags {
    _id
    name
    colorCode
  }

  form {
    ${formFields}
  }
`;

const integrations = `
  query Integrations($perPage: Int, $page: Int, $kind: String, $tag: String, $brandId: String, $status: String, $sortField: String, $sortDirection: Int) {
    integrations(perPage: $perPage, page: $page, kind: $kind, tag: $tag, brandId: $brandId, status: $status, sortField: $sortField, sortDirection: $sortDirection) {
      _id
      ${commonFields}
    }
  }
`;

const integrationDetail = `
  query integrationDetail($_id: String!) {
    integrationDetail(_id: $_id) {
      _id
      ${commonFields}
    }
  }
`;

const integrationsTotalCount = `
  query integrationsTotalCount($kind: String, $tag: String, $brandId: String, $status: String){
    integrationsTotalCount(kind:$kind, tag:$tag, brandId: $brandId, status: $status){
      byKind
      byTag
      byBrand
      byStatus
      total
    }
  }
`;

const fields = `
  query fields($contentType: String!) {
    fields(contentType: $contentType) {
      _id
      text
    }
  }
`;

export default {
  productCategories,
  integrations,
  integrationDetail,
  integrationsTotalCount,
  fields
};
