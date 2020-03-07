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
        description
        options
        isRequired
        order
        validation
      }
    }
  }
`;

export const formConnectMutation = `
  mutation widgetsLeadConnect($brandCode: String!, $formCode: String!) {
    widgetsLeadConnect(brandCode: $brandCode, formCode: $formCode) {
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
      errors {
        fieldId
        code
        text
      }
    }
  }
`;

export const sendEmailMutation = `
  mutation sendEmail($toEmails: [String], $fromEmail: String, $title: String, $content: String) {
    sendEmail(toEmails: $toEmails, fromEmail: $fromEmail, title: $title, content: $content)
  }
`;

export const increaseViewCountMutation = `
  mutation widgetsLeadIncreaseViewCount($formId: String!) {
    widgetsLeadIncreaseViewCount(formId: $formId)
  }
`;
