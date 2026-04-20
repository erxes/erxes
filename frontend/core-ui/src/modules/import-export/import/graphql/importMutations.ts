import { gql } from '@apollo/client';

export const IMPORT_CANCEL = gql`
  mutation ImportCancel($importId: String!) {
    importCancel(importId: $importId) {
      _id
      status
      errorFileUrl
      completedAt
    }
  }
`;

export const IMPORT_RETRY = gql`
  mutation ImportRetry($importId: String!) {
    importRetry(importId: $importId) {
      _id
      status
      errorFileUrl
      completedAt
    }
  }
`;

export const IMPORT_RESUME = gql`
  mutation ImportResume($importId: String!) {
    importResume(importId: $importId) {
      _id
      status
      errorFileUrl
      completedAt
    }
  }
`;
