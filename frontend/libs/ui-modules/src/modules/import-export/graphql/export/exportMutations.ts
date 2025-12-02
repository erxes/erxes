import { gql } from '@apollo/client';

export const START_EXPORT = gql`
  mutation ExportStart(
    $entityType: String!
    $fileFormat: String
    $filters: JSON
    $ids: [String]
    $selectedFields: [String]
  ) {
    exportStart(
      entityType: $entityType
      fileFormat: $fileFormat
      filters: $filters
      ids: $ids
      selectedFields: $selectedFields
    ) {
      _id
      entityType
      fileName
      status
      totalRows
      processedRows
      fileFormat
      fileKeys
      filters
      ids
      selectedFields
    }
  }
`;

export const CANCEL_EXPORT = gql`
  mutation ExportCancel($exportId: String!) {
    exportCancel(exportId: $exportId) {
      _id
      status
    }
  }
`;

export const RETRY_EXPORT = gql`
  mutation ExportRetry($exportId: String!) {
    exportRetry(exportId: $exportId) {
      _id
      status
      lastCursor
    }
  }
`;
