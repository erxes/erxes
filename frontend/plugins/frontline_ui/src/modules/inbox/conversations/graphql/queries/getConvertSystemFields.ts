import { gql } from '@apollo/client';

export const GET_CONVERT_SYSTEM_FIELDS = gql`
  query FrontlineConvertSystemFields($contentType: String!) {
    propertySystemFields(contentType: $contentType) {
      code
      name
      isVisibleToCreate
      isRequired
      logics
    }
  }
`;
