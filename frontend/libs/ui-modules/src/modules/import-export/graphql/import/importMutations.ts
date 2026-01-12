import { gql } from '@apollo/client';

export const START_IMPORT = gql`
  mutation ImportStart(
    $entityType: String!
    $fileKey: String!
    $fileName: String!
  ) {
    importStart(
      entityType: $entityType
      fileKey: $fileKey
      fileName: $fileName
    ) {
      _id
      entityType
      fileName
      status
      totalRows
      processedRows
      successRows
      errorRows
    }
  }
`;

export const CANCEL_IMPORT = gql`
  mutation ImportCancel($importId: String!) {
    importCancel(importId: $importId) {
      _id
      status
    }
  }
`;

export const RETRY_IMPORT = gql`
  mutation ImportRetry($importId: String!) {
    importRetry(importId: $importId) {
      _id
      status
    }
  }
`;

export const RESUME_IMPORT = gql`
  mutation ImportResume($importId: String!) {
    importResume(importId: $importId) {
      _id
      status
    }
  }
`;
