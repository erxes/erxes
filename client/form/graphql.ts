export const formQuery = `
  query form($formId: String) {
    form(formId: $formId) {
      title
      description
      buttonText
      themeColor
      fields {
        _id
        formId
        name
        type
        check
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

export const connectMutation = `
  mutation formConnect($brandCode: String!, $formCode: String!) {
    formConnect(brandCode: $brandCode, formCode: $formCode) {
      form {
        _id
        title
        description
        themeColor
        callout
        rules {
          _id
          kind
          text
          condition
          value
        }
      }
      integration {
        _id
        name
        languageCode
        formData
      }
    }
  }
`;

export const saveFormMutation = `
  mutation saveForm($integrationId: String!, $formId: String!, $submissions: [FieldValueInput], $browserInfo: JSON!) {
    saveForm(integrationId: $integrationId, formId: $formId, submissions: $submissions, browserInfo: $browserInfo) {
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
  mutation formIncreaseViewCount($formId: String!) {
    formIncreaseViewCount(formId: $formId)
  }
`;
