import React from 'react';
import { useMutation } from '@apollo/client';
import gql from 'graphql-tag';
// erxes
import Alert from '../../../utils/Alert';
// local
import Component from '../../components/chat/GroupChatAction';
import { queries, mutations } from '../../graphql';

type Props = {
  chat?: any;
};

const GroupChatContainer = (props: Props) => {
  const [editChatMutation] = useMutation(gql(mutations.chatEdit));

  const editChat = (_id: string, name?: any[], featuredImage?: string) => {
    editChatMutation({
      variables: { _id, name, featuredImage },
      refetchQueries: [{ query: gql(queries.chats) }]
    }).catch((error) => {
      Alert.error(error.message);
    });
  };

  return <Component {...props} editChat={editChat} />;
};

export default GroupChatContainer;
