import { gql } from '~/gql';

export const FRONTLINE_TICKET_SYSTEM_FIELD_RULES = gql(`
  query frontlineTicketSystemFieldRules($contentType: String!) {
    propertySystemFields(contentType: $contentType) {
      code
      isVisibleToCreate
      isRequired
    }
  }
`);
