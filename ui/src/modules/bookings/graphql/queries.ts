const bookingFields = `
  _id
  name
  size
  images
  font
  fontColor
  columnColor
  activeColumn
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

export default { bookingDetail, bookings };
