import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { AppConsumer } from '../../appContext';
import { IUser, Store } from '../../types';
import Ticket from '../components/Ticket';
import { queries } from '../graphql';

type Props = {
  currentUser: IUser;
};

function TicketContainer({ currentUser, ...props }: Props) {
  const { loading, data = {} as any } = useQuery(
    gql(queries.clientPortalTickets),
    {
      skip: !currentUser,
      fetchPolicy: 'network-only'
    }
  );

  const tickets = data.clientPortalTickets || [];

  const updatedProps = {
    ...props,
    tickets,
    loading,
    currentUser
  };

  return <Ticket {...updatedProps} />;
}

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ currentUser }: Store) => {
        return <TicketContainer {...props} currentUser={currentUser} />;
      }}
    </AppConsumer>
  );
};

export default WithConsumer;
