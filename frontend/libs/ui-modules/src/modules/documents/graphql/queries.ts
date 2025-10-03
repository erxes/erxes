import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';
import gql from 'graphql-tag';

export const ATTRIBUTE_QUERY = gql`
  query fieldsCombinedByContentType(
    $contentType: String!
    $usageType: String
    $excludedNames: [String]
    $segmentId: String
    $config: JSON
    $onlyDates: Boolean
  ) {
    fieldsCombinedByContentType(
      contentType: $contentType
      usageType: $usageType
      excludedNames: $excludedNames
      segmentId: $segmentId
      config: $config
      onlyDates: $onlyDates
    )
  }
`;

export const PROCESS_DOCUMENT = gql`
  query documentsProcess($_id: String!, $replacerIds: [String], $config: JSON) {
    documentsProcess(_id: $_id, replacerIds: $replacerIds, config: $config)
  }
`;

export const DOCUMENT_DETAIL = gql`
  query Document($_id: String!) {
    documentsDetail(_id: $_id) {
      _id
      name
    }
  }
`;

export const DOCUMENTS_QUERY = gql`
  query Documents($searchValue: String, $contentType: String, ${GQL_CURSOR_PARAM_DEFS}) {
    documents(searchValue: $searchValue, contentType: $contentType, ${GQL_CURSOR_PARAMS}) {
      list {
        _id
        name
        code
      }
      ${GQL_PAGE_INFO}
    }
  }
`;
