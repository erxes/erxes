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

const widgetsConnectMutation = `
  mutation widgetsBookingConnect($_id: String!) {
    widgetsBookingConnect(_id: $_id) {
      _id
      name
      languageCode
      formId
      
      leadData

      bookingData {
        name
        description
        image {
          name
          size
          type
          url
        }
        
        childCategories {
          ${productCategoryFields}
        }

        mainProductCategory {
          ${productCategoryFields}
        }

        productCategoryId

        categoryTree

        style

      }
    }
  }
`;

export const saveBookingMutation = `
  mutation widgetsSaveBooking($integrationId: String!, $formId: String!, $submissions: [FieldValueInput], $browserInfo: JSON!, $cachedCustomerId: String $productId: String) {
    widgetsSaveBooking(integrationId: $integrationId, formId: $formId, submissions: $submissions, browserInfo: $browserInfo, cachedCustomerId: $cachedCustomerId productId: $productId) {
      status
      messageId
      customerId
      errors {
        fieldId
        code
        text
      }
    }
  }
`;

export {
  productCategory,
  productDetail,
  formDetailQuery,
  widgetsConnectMutation
};
