import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import List from '../../components/switchboard/List';
import { gql, useQuery } from '@apollo/client';
import { queries } from '../../graphql';
import { Spinner } from '@erxes/ui/src/components';

type IProps = {
  navigate: any;
  location: any;
};

function ListContainer(props: IProps) {
  const defaultCallIntegration = localStorage.getItem(
    'config:call_integrations',
  );

  const inboxId = JSON.parse(defaultCallIntegration || '{}')?.inboxId;

  const { data, loading } = useQuery(gql(queries.callQueueList), {
    variables: {
      integrationId: inboxId,
    },
    nextFetchPolicy: 'network-only',
  });

  if (loading) {
    return <Spinner />;
  }
  const updatedProps = {
    ...props,
    queueList: data?.callQueueList || [],
  };
  return <List {...updatedProps} />;
}

export default ListContainer;
