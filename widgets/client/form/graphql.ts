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
        objectListConfigs{
          key
          label
          type
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
        products{
          _id
          name
          unitPrice
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
        paymentConfigIds
      }
    }
  }
`;

export const saveFormMutation = `
  mutation widgetsSaveLead($integrationId: String!, $formId: String!, $submissions: [FieldValueInput], $browserInfo: JSON!, $cachedCustomerId: String, $userId: String) {
    widgetsSaveLead(integrationId: $integrationId, formId: $formId, submissions: $submissions, browserInfo: $browserInfo, cachedCustomerId: $cachedCustomerId, userId: $userId) {
      status
      conversationId
      customerId
      errors {
        fieldId
        code
        text
      }
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

export const getPaymentOptions = `
query getPaymentOptions(
  $amount: Float
  $companyId: String
  $contentType: String
  $contentTypeId: String
  $customerId: String
  $description: String
  $paymentConfigIds: [String]
  $redirectUri: String
  $phone: String
) {
  getPaymentOptions(
    amount: $amount
    companyId: $companyId
    contentType: $contentType
    contentTypeId: $contentTypeId
    customerId: $customerId
    description: $description
    paymentConfigIds: $paymentConfigIds
    redirectUri: $redirectUri
    phone: $phone
  )
}
`
