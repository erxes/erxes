import { gql } from '@apollo/client';

export const GET_ACTIVE_EXPORTS = gql`
  query ActiveExports($entityType: String) {
    activeExports(entityType: $entityType) {
      _id
      entityType
      fileName
      status
      totalRows
      processedRows
      fileFormat
      fileKey
      filters
      ids
      progress
      elapsedSeconds
      rowsPerSecond
      estimatedSecondsRemaining
      errorMessage
      lastCursor
      startedAt
      completedAt
      createdAt
    }
  }
`;

export const GET_EXPORT_HEADERS = gql`
  query GetExportHeaders($entityType: String!) {
    exportHeaders(entityType: $entityType) {
      label
      key
      isDefault
      type
    }
  }
`;
