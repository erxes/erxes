import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
// erxes
import Spinner from '@erxes/ui/src/components/Spinner';
// local
import ChatInfo from '../components/ChatInfo';
import { queries } from '../graphql';

type Props = {
  chatId: string;
};

const ChatInfoContainer = (props: Props) => {
  const { chatId } = props;

  const { loading, data, error } = useQuery(gql(queries.chatDetail), {
    variables: { id: chatId }
  });

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  if (data.chatDetail) {
    return <ChatInfo chatDetail={data.chatDetail} />;
  }

  return <></>;
};

export default ChatInfoContainer;
