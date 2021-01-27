import Spinner from 'erxes-ui/lib/components/Spinner';
import { Alert } from 'erxes-ui/lib/utils';
import gql from 'graphql-tag';
import React from 'react';
import { useMutation, useQuery } from 'react-apollo';
import ClientPortal from '../components/ClientPortal';
import { GeneralFormType } from '../components/Form';
import mutations from '../graphql/mutations';
import queries from '../graphql/queries';

type DocTypes = GeneralFormType;

function ClientPortalContainer() {
  const { loading, data } = useQuery(gql(queries.getConfig));
  const [update] = useMutation(gql(mutations.updateConfig));

  if (loading) {
    return <Spinner />;
  }

  const handleUpdate = (doc: DocTypes) => {
    update({ variables: doc })
      .then(() =>
        Alert.success('Successfully updated the Client portal config')
      )
      .catch(e => Alert.error(e.message));
  };

  const config = data.configClientPortal || {};

  return <ClientPortal config={config} handleUpdate={handleUpdate} />;
}

export default ClientPortalContainer;
