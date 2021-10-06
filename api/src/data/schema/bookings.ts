export const types = `
  input BookingStylesInput {
    itemShape: String
    widgetColor: String
    productAvailable: String
    productUnavailable: String
    productSelected: String

    textAvailable: String
    textUnavailable: String
    textSelected: String
  }

  type BookingStylesType {
    itemShape: String
    widgetColor: String

    productAvailable: String
    productUnavailable: String
    productSelected: String

    textAvailable: String
    textUnavailable: String
    textSelected: String
  }
  
  type CategoryTree {
    _id: String!
    name: String
    parentId: String
    type: String
  }

  type Booking {
    _id: String!
    name: String
    image: Attachment
 
    description: String
    userFilters: [String]
    productCategoryId: String

    styles: BookingStylesType

    title: String
    brandId: String
    channelIds: [String]
    languageCode: String
    formId: String
    buttonText: String

    createdDate: Date
    viewCount: Int
    brand: Brand

    createdBy: String
    createdUser: User

    tagIds: [String]
    tags: [Tag]

    childCategories: [ProductCategory]

    categoryTree: [CategoryTree]
    mainProductCategory: ProductCategory
  }

  type bookingsTotalCount {
    total: Int
    byTag: JSON
    byChannel: JSON
    byBrand: JSON
    byStatus: JSON
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  brandId: String
  tagId: String
`;

export const queries = `
  bookingDetail(_id: String!): Booking
  bookings(${queryParams}): [Booking]
  bookingsTotalCount: bookingsTotalCount
`;

const bookingMutationParams = `
  name: String
  image: AttachmentInput
  description: String
  userFilters: [String]
  productCategoryId: String

  styles: BookingStylesInput

  title: String
  brandId: String
  channelIds: [String]
  languageCode: String
  formId: String
  buttonText: String
  tagIds: [String]
`;

export const mutations = `
  bookingsAdd(${bookingMutationParams}): Booking
  bookingsEdit(_id: String!, ${bookingMutationParams}): Booking
  bookingsRemove(_id: String!): JSON
`;
