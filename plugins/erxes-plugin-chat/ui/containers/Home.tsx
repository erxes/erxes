import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';

import Home from '../components/Home';
import { queries } from '../graphql';

type Props = {
  queryParams: any;
};

export default function HomeContainer(props: Props) {
  const chatsResponse = useQuery(gql(queries.chats));

  if (chatsResponse.loading) {
    return <div>...</div>;
  }

  if (chatsResponse.error) {
    return <div>{chatsResponse.error.message}</div>;
  }

  return <Home chats={chatsResponse.data.chats} {...props} />;
}
