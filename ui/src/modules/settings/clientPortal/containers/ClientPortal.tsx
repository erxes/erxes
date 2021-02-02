import Spinner from 'erxes-ui/lib/components/Spinner';
import { Alert } from 'erxes-ui/lib/utils';
import gql from 'graphql-tag';
import routerUtils from 'modules/common/utils/router';
import React from 'react';
import { useMutation, useQuery } from 'react-apollo';
import ClientPortal from '../components/ClientPortal';
import mutations from '../graphql/mutations';
import queries from '../graphql/queries';
import { ClientPortalConfig, ClientPortalConfigQueryResponse } from '../types';

type Props = {
  queryParams: any;
  history: any;
};

function ClientPortalContainer({ queryParams, history, ...props }: Props) {
  const { loading, data = {} } = useQuery<ClientPortalConfigQueryResponse>(
    gql(queries.getConfig),
    {
      variables: { _id: queryParams._id },
      skip: !queryParams._id
    }
  );

  const [mutate] = useMutation(gql(mutations.createOrUpdateConfig));

  if (loading) {
    return <Spinner />;
  }

  const handleUpdate = (doc: ClientPortalConfig) => {
    mutate({ variables: { _id: queryParams._id, ...doc } })
      .then((response = {}) => {
        const { configUpdateClientPortal = {} } = response.data || {};

        if (configUpdateClientPortal) {
          routerUtils.setParams(history, { _id: configUpdateClientPortal._id });
        }

        Alert.success('Successfully updated the Client portal config');
      })
      .catch(e => Alert.error(e.message));
  };

  const config = data.getConfig || {};

  return <ClientPortal config={config} handleUpdate={handleUpdate} />;
}

export default ClientPortalContainer;
