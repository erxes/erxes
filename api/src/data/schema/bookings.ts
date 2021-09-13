export const types = `
  input StylesInput {
    itemShape: String,
    widgetColor: String,
    productAvailable: String,
    productUnavailable: String,
    productSelected: String,

    textAvailable: String,
    textUnavailable: String,
    textSelected: String
  }

  type StylesType {
    itemShape: String,
    widgetColor: String,
    productAvailable: String,
    productUnavailable: String,
    productSelected: String,

    textAvailable: String,
    textUnavailable: String,
    textSelected: String
  }

  type Booking {
    _id: String!,
    name: String,
    image: Attachment,
 
    description: String,
    userFilters: [String],
    productCategoryId: String,

    styles: StylesType,

    title: String,
    brandId: String,
    channelIds: [String],
    languageCode: String,
    productStatus: String,
    formId: String,
    buttonText: String
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

  styles: StylesInput

  title: String,
  brandId: String,
  channelIds: [String],
  languageCode: String,
  productStatus: String,
  formId: String,
  buttonText: String
`;

export const mutations = `
  bookingsAdd(${bookingMutationParams}): Booking
  bookingsEdit(_id: String!, ${bookingMutationParams}): Booking
  bookingsRemove(_id: String!): JSON
`;
