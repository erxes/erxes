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

  styles {
    ${styleFields}
  }

  mainProductCategory {
    ${productCategoryFields}
  }
`;

const queryParamsDef = `
  $page: Int,
  $perPage: Int,
  $brandId: String,
  $tagId: String
`;
const queryParamsVal = `
  page: $page,
  perPage: $perPage,
  brandId: $brandId,
  tagId: $tagId
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

const forms = `
  query forms {
    forms {
      _id
      title
    }
  }
`;

const bookingsTotalCount = `
  query bookingsTotalCount{
    bookingsTotalCount{
      total
      byTag
      byChannel
      byBrand
      byStatus
    }
  }
`;

export default {
  bookingDetail,
  bookings,
  productCategories,
  forms,
  bookingsTotalCount
};
