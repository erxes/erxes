import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

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

export const GET_IMPORT_HISTORIES = gql`
  query ImportHistories($entityType: String, ${GQL_CURSOR_PARAM_DEFS}) {
    importHistories(entityType: $entityType, ${GQL_CURSOR_PARAMS}) {
      list {
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
        startedAt
        completedAt
        createdAt
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const IMPORT_COLUMN_PREVIEW = gql`
  query ImportColumnPreview(
    $entityType: String!
    $fileKey: String!
    $fileName: String!
  ) {
    importColumnPreview(
      entityType: $entityType
      fileKey: $fileKey
      fileName: $fileName
    ) {
      totalRows
      columns {
        index
        header
        key
        confidence
        status
        sampleValues
      }
      fields {
        key
        label
        type
        dataType
        options
        example
        required
      }
    }
  }
`;

export const IMPORT_FIELDS = gql`
  query ImportFields($entityType: String!) {
    importFields(entityType: $entityType) {
      key
      label
      type
      dataType
      options
      example
      required
    }
  }
`;
