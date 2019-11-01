export const formQuery = `
  query form($formId: String) {
    form(formId: $formId) {
      title
      description
      buttonText
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
  mutation leadConnect($brandCode: String!, $formCode: String!) {
    leadConnect(brandCode: $brandCode, formCode: $formCode) {
      form {
        _id
        title
        description
      }
      integration {
        _id
        name
        languageCode
        leadData
      }
    }
  }
`;

export const saveFormMutation = `
  mutation saveLead($integrationId: String!, $formId: String!, $submissions: [FieldValueInput], $browserInfo: JSON!) {
    saveLead(integrationId: $integrationId, formId: $formId, submissions: $submissions, browserInfo: $browserInfo) {
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
  mutation leadIncreaseViewCount($formId: String!) {
    leadIncreaseViewCount(formId: $formId)
  }
`;
