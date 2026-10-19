import { gql } from '~/gql';

export const REMOVE_INTEGRATION = gql(`
  mutation IntegrationsRemove($id: String!) {
    integrationsRemove(_id: $id)
  }
`);
