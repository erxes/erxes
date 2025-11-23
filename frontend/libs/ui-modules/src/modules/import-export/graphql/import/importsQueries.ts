import { gql } from '@apollo/client';

export const GET_ACTIVE_IMPORTS = gql`
  query ActiveImports($entityType: String) {
    activeImports(entityType: $entityType) {
      _id
      entityType
      fileName
      status
      totalRows
      processedRows
      successRows
      errorRows
      errorFileUrl
      progress
      elapsedSeconds
      rowsPerSecond
      estimatedSecondsRemaining
    }
  }
`;
