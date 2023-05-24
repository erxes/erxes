import { Config, IUser, Store } from '../../types';
import { gql, useQuery } from '@apollo/client';

import { AppConsumer } from '../../appContext';
import Purchase from '../components/Purchase';
import React from 'react';
import Spinner from '../../common/Spinner';
import { queries } from '../graphql';

type Props = {
  currentUser: IUser;
  config: Config;
};

function PurchaseContainer({ currentUser, ...props }: Props) {
  const { loading, data = {} as any } = useQuery(
    gql(queries.clientPortalPurchases),
    {
      skip: !currentUser,
      fetchPolicy: 'network-only'
    }
  );

  const { loading: loadingStages, data: stages = {} as any } = useQuery(
    gql(queries.stages),
    {
      skip: !props?.config?.purchasePipelineId,
      fetchPolicy: 'network-only',
      variables: { pipelineId: props?.config?.purchasePipelineId }
    }
  );

  const { loading: loadingLable, data: pipeLinelabels = {} as any } = useQuery(
    gql(queries.pipelineLabels),
    {
      skip: !props?.config?.purchasePipelineId,
      fetchPolicy: 'network-only',
      variables: { pipelineId: props?.config?.purchasePipelineId }
    }
  );

  const {
    loading: loadingAssignedUsers,
    data: pipelineAssignedUsers = {} as any
  } = useQuery(gql(queries.pipelineAssignedUsers), {
    skip: !props?.config?.purchasePipelineId,
    fetchPolicy: 'network-only',
    variables: { _id: props?.config?.purchasePipelineId }
  });

  if (loading) {
    return <Spinner objective={true} />;
  }

  if (loading || loadingStages || loadingLable || loadingAssignedUsers) {
    return <Spinner objective={true} />;
  }

  const purchases = data.clientPortalPurchases || [];

  const updatedProps = {
    ...props,
    purchases,
    loading,
    currentUser,
    stages,
    pipeLinelabels,
    pipelineAssignedUsers
  };

  return <Purchase {...updatedProps} />;
}

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ currentUser }: Store) => {
        return <PurchaseContainer {...props} currentUser={currentUser} />;
      }}
    </AppConsumer>
  );
};

export default WithConsumer;
