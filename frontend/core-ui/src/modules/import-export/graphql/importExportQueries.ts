import { gql } from '@apollo/client';

export const GET_IMPORT_EXPORT_TYPES = gql`
  query ImportExportTypes($operation: ImportExportOperation!) {
    importExportTypes(operation: $operation) {
      label
      contentType
    }
  }
`;
