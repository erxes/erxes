const bookingMutationParamsDef = `
  $name: String!
  $image: AttachmentInput
  $description: String
  $productCategoryId: String,

  $title: String,
  $brandId: String,
  $channelIds: [String],
  $languageCode: String,
  $productStatus: String,
  $formId: String,
  $buttonText: String

  $styles: BookingStylesInput
`;

const bookingMutationParamsVal = `
  name: $name
  image: $image
  description: $description
  productCategoryId: $productCategoryId

  title: $title,
  brandId: $brandId,
  channelIds: $channelIds,
  languageCode: $languageCode,
  productStatus: $productStatus,
  formId: $formId,
  buttonText: $buttonText

  styles: $styles
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

export default {
  bookingsAdd,
  bookingsRemove,
  bookingsEdit
};
