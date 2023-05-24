import { Config, IUser, Store } from '../../types';
import { gql, useQuery } from '@apollo/client';

import { AppConsumer } from '../../appContext';
import React, { useState } from 'react';
import Spinner from '../../common/Spinner';
import Group from '../components/Group';
import { queries } from '../graphql';

type Props = {
  currentUser: IUser;
  config: Config;
  type: string;
  id: any;
  deals: any;
};

function GroupContainer({ currentUser, ...props }: Props) {
  const { loading, data = {} as any } = useQuery(
    gql(queries.clientPortalDeals),
    {
      skip: !currentUser,
      fetchPolicy: 'network-only',
      variables: {
        ...(props.type === 'priority' && { priority: [props.id] }),
        ...(props.type === 'label' && { labelIds: [props.id] }),
        ...(props.type === 'duedate' && { closeDateType: props.id }),
        ...(props.type === 'stage' && { stageId: props.id }),
        ...(props.type === 'user' && { userIds: [props.id] })
      }
    }
  );

  if (loading) {
    return <Spinner objective={true} />;
  }

  const tasks = data.clientPortalDeals || [];

  const updatedProps = {
    ...props,
    tasks,
    loading,
    currentUser
  };

  return <Group {...updatedProps} />;
}

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ currentUser, config }: Store) => {
        return (
          <GroupContainer
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
