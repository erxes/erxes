import { gql } from '~/gql';

export const ARCHIVE_INTEGRATION = gql(`
  mutation IntegrationsArchive($id: String!, $status: Boolean!) {
    integrationsArchive(_id: $id, status: $status) {
      _id
    }
  }
`);
