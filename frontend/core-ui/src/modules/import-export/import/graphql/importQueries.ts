import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const GET_IMPORT_HISTORIES = gql`
  query ImportHistories($entityTypes: [String], ${GQL_CURSOR_PARAM_DEFS}) {
    importHistories(entityTypes: $entityTypes, ${GQL_CURSOR_PARAMS}) {
      list {
        _id
        entityType
        fileName
        fileKey
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
        startedAt
        completedAt
        createdAt
      }
      ${GQL_PAGE_INFO}
    }
  }
`;
