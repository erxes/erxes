import { gql } from '~/gql';

// Settings → Properties rules for a ticket system field, edited from the
// pipeline's create form editor.
export const FRONTLINE_TICKET_SYSTEM_FIELD_EDIT = gql(`
  mutation frontlineTicketSystemFieldEdit(
    $contentType: String!
    $code: String!
    $isVisibleToCreate: Boolean
    $isRequired: Boolean
  ) {
    propertySystemFieldEdit(
      contentType: $contentType
      code: $code
      isVisibleToCreate: $isVisibleToCreate
      isRequired: $isRequired
    ) {
      code
      isVisibleToCreate
      isRequired
    }
  }
`);

export const FRONTLINE_TICKET_FIELD_EDIT = gql(`
  mutation frontlineTicketFieldEdit(
    $_id: String!
    $isVisibleToCreate: Boolean
    $isRequired: Boolean
  ) {
    fieldEdit(
      _id: $_id
      isVisibleToCreate: $isVisibleToCreate
      isRequired: $isRequired
    ) {
      _id
      isVisibleToCreate
      isRequired
    }
  }
`);
