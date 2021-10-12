const bookingMutationParamsDef = `
  $name: String!
  $image: AttachmentInput
  $description: String
  $productCategoryId: String

  $userFilters: [String]

  $title: String
  $brandId: String
  $channelIds: [String]
  $languageCode: String
  $formId: String

  $styles: BookingStylesInput
  $displayBlock: DisplayBlockInput
  $leadData: BookingLeadData
`;

const bookingMutationParamsVal = `
  name: $name
  image: $image
  description: $description
  productCategoryId: $productCategoryId

  userFilters: $userFilters

  title: $title,
  brandId: $brandId,
  channelIds: $channelIds
  languageCode: $languageCode
  formId: $formId

  styles: $styles
  displayBlock: $displayBlock
  leadData: $leadData
`;

const bookingsAdd = `
  mutation bookingsAdd(${bookingMutationParamsDef}) {
    bookingsAdd(${bookingMutationParamsVal}) {
      _id
    }
  }
`;

const bookingsEdit = `
  mutation bookingsEdit($_id: String!, ${bookingMutationParamsDef}) {
    bookingsEdit(_id: $_id, ${bookingMutationParamsVal}) {
      _id
    }
  }
`;

const bookingsRemove = `
  mutation bookingsRemove($_id: String!) {
    bookingsRemove(_id: $_id)
  }
`;

const bookingsArchive = `
  mutation bookingsArchive($_id: String! $status: Boolean!) {
    bookingsArchive(_id: $_id, status: $status) {
      _id
    }
  }
`;

export default {
  bookingsAdd,
  bookingsRemove,
  bookingsEdit,
  bookingsArchive
};
