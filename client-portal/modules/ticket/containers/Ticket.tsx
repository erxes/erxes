import { Config, IUser, Store } from '../../types';
import { gql, useQuery } from '@apollo/client';

import { AppConsumer } from '../../appContext';
import React, { useState } from 'react';
import Spinner from '../../common/Spinner';
import Ticket from '../components/Ticket';
import { queries } from '../graphql';

type Props = {
  currentUser: IUser;
  config: Config;
};

const MODES = ['stage', 'label', 'priority', 'duedate', 'user'];

function TicketContainer({ currentUser, ...props }: Props) {
  const { loading, data = {} as any } = useQuery(
    gql(queries.clientPortalTickets),
    {
      skip: !currentUser,
      fetchPolicy: 'network-only'
    }
  );

  const { loading: loadingStages, data: stages = {} as any } = useQuery(
    gql(queries.stages),
    {
      skip: !props?.config?.ticketPipelineId,
      fetchPolicy: 'network-only',
      variables: { pipelineId: props?.config?.ticketPipelineId }
    }
  );

  const { loading: loadingLable, data: pipeLinelabels = {} as any } = useQuery(
    gql(queries.pipelineLabels),
    {
      skip: !props?.config?.ticketPipelineId,
      fetchPolicy: 'network-only',
      variables: { pipelineId: props?.config?.ticketPipelineId }
    }
  );
  const {
    loading: loadingAssignedUsers,
    data: pipelineAssignedUsers = {} as any
  } = useQuery(gql(queries.pipelineAssignedUsers), {
    skip: !props?.config?.ticketPipelineId,
    fetchPolicy: 'network-only',
    variables: { _id: props?.config?.ticketPipelineId }
  });

  if (loading || loadingStages || loadingLable || loadingAssignedUsers) {
    return <Spinner objective={true} />;
  }

  const tickets = data.clientPortalTickets || [];

  const updatedProps = {
    ...props,
    tickets,
    loading,
    currentUser,
    stages,
    pipeLinelabels,
    pipelineAssignedUsers
  };

  return <Ticket {...updatedProps} />;
}

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ currentUser, config }: Store) => {
        return (
          <TicketContainer
            {...props}
            config={config}
            currentUser={currentUser}
          />
        );
      }}
    </AppConsumer>
  );
};

export default WithConsumer;
