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
`;

const bookingDetail = `
  query bookingDetail($_id: String!) {
    bookingDetail(_id: $_id) {
      ${bookingFields}  
    }
  }
`;

const bookings = `
  query bookings($page: Int, $perPage: Int) {
    bookings(page: $page, perPage: $perPage) {
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
