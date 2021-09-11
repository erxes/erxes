export const types = `
  type Booking {
    _id: String!,
    name: String,
    image: [String],
 
    description: String,
    userFilters: [String],
    productCategoryId: String
  }

  type Floor {
    _id: String!
    bookingId: String,
    margin: String,
    blockNumber: Int,
    floorNumber: Int,
    cardColor: String,
    activeCard: String,
    cardShape: String
  }

  type Card {
    _id: String!
    floorId: String,
    productId: String,
    stage: String,
    order: String
  }
`;

export const queries = `
  bookingDetail(_id: String!): Booking
  bookings(page: Int, perPage: Int): [Booking]
`;

const bookingMutationParams = `
  name: String,
  image: [String],
  description: String,
  userFilters: [String],
  productCategoryId: String
`;

const floorsMutationParams = `
  bookingId: String,
  margin: String,
  blockNumber: Int,
  floorNumber: Int,
  cardColor: String,
  activeCard: String,
  cardShape: String
`;

const cardMutationParams = `
  floorId: String,
  productId: String,
  stage: String,
  order: String
`;

export const mutations = `
  bookingsAdd(${bookingMutationParams}): Booking
  bookingsEdit(_id: String!, ${bookingMutationParams}): Booking
  bookingsRemove(_id: String!): JSON

  floorsAdd(${floorsMutationParams}): Floor
  floorsEdit(_id: String!, ${floorsMutationParams}): Floor
  floorsRemove(_id: String!): JSON

  cardsAdd(${cardMutationParams}): Card
  cardsEdit(_id: String!, ${cardMutationParams}): Card
  cardsRemove(_id: String!): JSON
`;
