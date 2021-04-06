export const formDetailQuery = `
  query formDetail($_id: String!) {
    formDetail(_id: $_id) {
      title
      description
      buttonText

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
    }
  }
`;

export const sendEmailMutation = `
  mutation widgetsSendEmail($toEmails: [String], $fromEmail: String, $title: String, $content: String, $customerId: String, $formId: String) {
    widgetsSendEmail(toEmails: $toEmails, fromEmail: $fromEmail, title: $title, content: $content, customerId: $customerId, formId: $formId)
  }
`;

export const increaseViewCountMutation = `
  mutation widgetsLeadIncreaseViewCount($formId: String!) {
    widgetsLeadIncreaseViewCount(formId: $formId)
  }
`;
