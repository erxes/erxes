import { Config, IUser, Store } from '../../types';
import { gql, useQuery } from '@apollo/client';

import { AppConsumer } from '../../appContext';
import Deal from '../components/Deal';
import React from 'react';
import Spinner from '../../common/Spinner';
import { queries } from '../graphql';

type Props = {
  currentUser: IUser;
  config: Config;
};

function DealContainer({ currentUser, ...props }: Props) {
  const { loading, data = {} as any } = useQuery(
    gql(queries.clientPortalDeals),
    {
      skip: !currentUser,
      fetchPolicy: 'network-only'
    }
  );

  const { loading: loadingStages, data: stages = {} as any } = useQuery(
    gql(queries.stages),
    {
      skip: !props?.config?.dealPipelineId,
      fetchPolicy: 'network-only',
      variables: { pipelineId: props?.config?.dealPipelineId }
    }
  );

  const { loading: loadingLable, data: pipeLinelabels = {} as any } = useQuery(
    gql(queries.pipelineLabels),
    {
      skip: !props?.config?.dealPipelineId,
      fetchPolicy: 'network-only',
      variables: { pipelineId: props?.config?.dealPipelineId }
    }
  );

  const {
    loading: loadingAssignedUsers,
    data: pipelineAssignedUsers = {} as any
  } = useQuery(gql(queries.pipelineAssignedUsers), {
    skip: !props?.config?.dealPipelineId,
    fetchPolicy: 'network-only',
    variables: { _id: props?.config?.dealPipelineId }
  });

  if (loading) {
    return <Spinner objective={true} />;
  }

  if (loading || loadingStages || loadingLable || loadingAssignedUsers) {
    return <Spinner objective={true} />;
  }

  const deals = data.clientPortalDeals || [];

  const updatedProps = {
    ...props,
    deals,
    loading,
    currentUser,
    stages,
    pipeLinelabels,
    pipelineAssignedUsers
  };

  return <Deal {...updatedProps} />;
}

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ currentUser }: Store) => {
        return <DealContainer {...props} currentUser={currentUser} />;
      }}
    </AppConsumer>
  );
};

export default WithConsumer;
