export const types = `
  type Booking {
    _id: String!,
    name: String,
    image: Attachment,
 
    description: String,
    userFilters: [String],
    productCategoryId: String
  }
`;

export const queries = `
  bookingDetail(_id: String!): Booking
  bookings(page: Int, perPage: Int): [Booking]
`;

const bookingMutationParams = `
  name: String,
  image: AttachmentInput,
  description: String,
  userFilters: [String],
  productCategoryId: String
`;

export const mutations = `
  bookingsAdd(${bookingMutationParams}): Booking
  bookingsEdit(_id: String!, ${bookingMutationParams}): Booking
  bookingsRemove(_id: String!): JSON
`;
