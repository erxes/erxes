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
  formId
  buttonText

  productCategoryId

  styles {
    itemShape
    widgetColor

    productAvailable
    productUnavailable
    productSelected

    textAvailable
    textUnavailable
    textSelected
  }
`;

export const bookingDetail = `
  query bookingDetail($_id: String!) {
    bookingDetail(_id: $_id) {
      ${bookingFields}
    }
  }
`;
