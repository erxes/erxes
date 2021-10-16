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

export const commonFields = `
  brandId
  name
  kind
  code
  brand {
    _id
    name
    code
  }
  channels {
    _id
    name
  }
  languageCode

  bookingData {
    name
    image {
      name
      type
      url
      size
    }

    viewCount
 
    description
    userFilters
    productCategoryId

    style
    displayBlock

    childCategories {
      _id
    }
    
    categoryTree
    
    mainProductCategory {
      _id
    }
  }

  formId

  tags {
    _id
    name
    colorCode
  }

  form {
    ${formFields}
  }
  
  tagIds

  isActive
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

export default {
  productCategories,
  fieldsGroups,
  integrations,
  integrationDetail,
  integrationsTotalCount
};
