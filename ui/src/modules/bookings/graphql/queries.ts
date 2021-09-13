const bookingFields = `
  _id
  name

  image {
    name
    url
    type
    size
  }

  description

  createdDate

  brand {
    _id
    name
  }

  createdUser {
    _id

    details {
      avatar
      fullName
      position
    }
  }
  
  title
  brandId
  channelIds
  languageCode
  productStatus
  formId
  buttonText
`;

const queryParamsDef = `
  $page: Int,
  $perPage: Int,
  $brandId: String
`;
const queryParamsVal = `
  page: $page,
  perPage: $perPage,
  brandId: $brandId
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
    }
  }
`;

export default { bookingDetail, bookings, productCategories };
