const productCategoryFields = `
  _id
  name
  order
  code
  parentId
  description
  status
  attachment {
    name
    url
    type
    size
  }

  isRoot
  productCount
`;

const productFields = `
  _id
  name

  type
  code

  description
  unitPrice
  sku
  
  createdAt

  category {
    _id
    code
    name
  }
  attachment {    
    url
    name    
    size
    type
  }
  attachmentMore {
    url
    name    
    size
    type
  }
  productCount

  customFieldsDataWithText
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

const displayBlockFields = `
  shape
  columns
  rows
  margin
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
  productCategoryId

  childCategories {
    ${productCategoryFields}
  }

  mainProductCategory {
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

  displayBlock {
    ${displayBlockFields}
  }

  leadData
`;

const bookingDetail = `
  query widgetsBookingDetail($_id: String!) {
    widgetsBookingDetail(_id: $_id) {
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

const increaseViewCountMutation = `
  mutation widgetsBookingIncreaseViewCount($_id: String!) {
    widgetsBookingIncreaseViewCount(_id: $_id)
  }
`;

const formDetailQuery = `
  query formDetail($_id: String!) {
    formDetail(_id: $_id) {
      title
      description
      buttonText
      numberOfPages
      code

      fields {
        _id
        name
        type
        text
        content
        description
        options
        isRequired
        order
        validation
        associatedFieldId
        column
        
        groupId
        logicAction
        pageNumber
        logics {
          fieldId
          logicOperator
          logicValue
        }
      }
    }
  }
`;

export {
  bookingDetail,
  productCategory,
  productDetail,
  increaseViewCountMutation,
  formDetailQuery
};
