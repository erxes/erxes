import gql from 'graphql-tag';
import Spinner from 'modules/common/components/Spinner';
import Alert from 'modules/common/utils/Alert';
import routerUtils from 'modules/common/utils/router';
import React from 'react';
import { useMutation, useQuery } from 'react-apollo';
import ClientPortalDetail from '../components/ClientPortalDetail';
import mutations from '../graphql/mutations';
import queries from '../graphql/queries';
import { ClientPortalConfig, ClientPortalConfigQueryResponse } from '../types';

type Props = {
  queryParams: any;
  history: any;
};

function ClientPortalDetailContainer({
  queryParams,
  history,
  ...props
}: Props) {
  const { loading, data = {} } = useQuery<ClientPortalConfigQueryResponse>(
    gql(queries.getConfig),
    {
      variables: { _id: queryParams._id },
      skip: !queryParams._id
    }
  );

  const [mutate] = useMutation(gql(mutations.createOrUpdateConfig), {
    refetchQueries: [{ query: gql(queries.getConfigs) }]
  });

  if (loading) {
    return <Spinner />;
  }

  const handleUpdate = (doc: ClientPortalConfig) => {
    mutate({ variables: { _id: queryParams._id, ...doc } })
      .then((response = {}) => {
        const { clientPortalConfigUpdate = {} } = response.data || {};

        if (clientPortalConfigUpdate) {
          routerUtils.setParams(history, { _id: clientPortalConfigUpdate._id });
        }

        Alert.success('Successfully updated the Client portal config');
      })
      .catch(e => Alert.error(e.message));
  };

  const updatedProps = {
    ...props,
    loading,
    config: data.clientPortalGetConfig || {},
    handleUpdate
  };

  return <ClientPortalDetail {...updatedProps} />;
}

export default ClientPortalDetailContainer;
