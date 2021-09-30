const productCategoryFields = `
  _id
  name
  description
  code
  parentId
`;

const styleFields = `
  itemShape
  widgetColor

  productAvailable
  productUnavailable
  productSelected

  textAvailable
  textUnavailable
  textSelected
`;

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
  title
  languageCode
  formId
  buttonText
  productCategoryId

  childCategories {
    ${productCategoryFields}
  }

  categoryTree {
    _id
    name
    parentId
    type
  }

  styles {
    ${styleFields}
  }
`;

const bookingDetail = `
  query bookingDetail($_id: String!) {
    bookingDetail(_id: $_id) {
      ${bookingFields}
    }
  }
`;

export { bookingDetail };
