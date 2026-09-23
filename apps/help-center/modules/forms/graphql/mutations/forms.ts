import { gql } from '@apollo/client';

export const FORM_PORTAL_SUBMIT = gql`
  mutation kbFormSubmit(
    $formId: String!
    $submissions: [FieldValueInput]
    $browserInfo: JSON!
  ) {
    cpWidgetsSaveLead(
      formId: $formId
      submissions: $submissions
      browserInfo: $browserInfo
    ) {
      status
      errors {
        fieldId
        text
      }
    }
  }
`;
