import React from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
// erxes
import { Alert } from '@erxes/ui/src/utils';
// local
import EditorComponent from '../components/Editor';
import { mutations, queries } from '../graphql';

type Props = {
  chatId: string;
  type?: string;
  reply?: any;
  setReply: (message: any) => void;
};

const EditorContainer = (props: Props) => {
  const { chatId, reply } = props;
  const [addMutation] = useMutation(gql(mutations.chatMessageAdd));

  const sendMessage = (content: string, _attachments: any[]) => {
    if (!content) {
      return;
    }

    const relatedId = (reply && reply._id) || null;
    const attachments = _attachments || null;

    addMutation({
      variables: { content, chatId, relatedId, attachments },
      refetchQueries: [{ query: gql(queries.chats) }]
    }).catch(error => {
      Alert.error(error.message);
    });
  };

  return <EditorComponent {...props} sendMessage={sendMessage} />;
};

export default EditorContainer;
