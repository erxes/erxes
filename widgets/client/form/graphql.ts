export const formDetailQuery = `
  query formDetail($_id: String!) {
    formDetail(_id: $_id) {
      title
      description
      buttonText
      numberOfPages
      googleMapApiKey
      code

      fields {
        _id
        name
        type
        text
        content
        description
        options
        locationOptions{
          lat
          lng
          description
        }
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

export const formConnectMutation = `
  mutation widgetsLeadConnect($brandCode: String!, $formCode: String!, $cachedCustomerId: String) {
    widgetsLeadConnect(brandCode: $brandCode, formCode: $formCode, cachedCustomerId:$cachedCustomerId) {
      form {
        _id
        title
        description
      }
      integration {
        _id
        name
        leadData
        languageCode
      }
    }
  }
`;

export const saveFormMutation = `
  mutation widgetsSaveLead($integrationId: String!, $formId: String!, $submissions: [FieldValueInput], $browserInfo: JSON!, $cachedCustomerId: String) {
    widgetsSaveLead(integrationId: $integrationId, formId: $formId, submissions: $submissions, browserInfo: $browserInfo, cachedCustomerId: $cachedCustomerId) {
      status
      messageId
      customerId
      errors {
        fieldId
        code
        text
      }
      invoiceResponse
      invoiceType
    }
  }
`;

export const sendEmailMutation = `
  mutation widgetsSendEmail($toEmails: [String], $fromEmail: String, $title: String, $content: String, $customerId: String, $formId: String, $attachments: [AttachmentInput]) {
    widgetsSendEmail(toEmails: $toEmails, fromEmail: $fromEmail, title: $title, content: $content, customerId: $customerId, formId: $formId, attachments: $attachments)
  }
`;

export const increaseViewCountMutation = `
  mutation widgetsLeadIncreaseViewCount($formId: String!) {
    widgetsLeadIncreaseViewCount(formId: $formId)
  }
`;

export const cancelOrderMutation = `
  mutation widgetsCancelOrder($customerId: String!, $messageId: String!) {
    widgetsCancelOrder(customerId: $customerId, messageId: $messageId)
  }
`;

export const formInvoiceUpdated = `
  subscription formInvoiceUpdated($messageId: String) {
    formInvoiceUpdated(messageId: $messageId) 
  }
`;
