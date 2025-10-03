import { gql } from '@apollo/client';

export const REMOVE_INTEGRATION = gql`
  mutation IntegrationsRemove($id: String!) {
    integrationsRemove(_id: $id)
  }
`;
