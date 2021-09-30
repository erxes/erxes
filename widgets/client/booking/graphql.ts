const productCategoryFields = `
  _id
  name
  description
  code
  parentId
`;

const productFields = `
  _id
  name
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

const productCategory = `
  query widgetsProductCategory($_id: String!) {
    widgetsProductCategory(_id: $_id) {
      ${productCategoryFields}
    }
  }
`;

const productDetail = `
  query widgetsProductDetail($_id: String!) {
    widgetsProductDetail(_id: $_id) {
      ${productFields}
    }
  }
`;

export { bookingDetail, productCategory, productDetail };
