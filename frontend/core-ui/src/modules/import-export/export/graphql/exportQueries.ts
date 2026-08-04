import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const GET_EXPORT_HISTORIES = gql`
  query ExportHistories($entityTypes: [String], ${GQL_CURSOR_PARAM_DEFS}) {
    exportHistories(entityTypes: $entityTypes, ${GQL_CURSOR_PARAMS}) {
      list {
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
      ${GQL_PAGE_INFO}
    }
  }
`;
