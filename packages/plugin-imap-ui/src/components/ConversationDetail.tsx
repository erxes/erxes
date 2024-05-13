import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { __ } from '@erxes/ui/src';
import MailConversation from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/mail/MailConversation';
import { queries } from '../graphql';
import { IConversation } from '@erxes/ui-inbox/src/inbox/types';

type Props = {
  currentId: string;
  currentConversation: IConversation;
};

const Detail = (props: Props) => {
  const { currentId, currentConversation } = props;

  const messagesQuery = useQuery(gql(queries.detail), {
    variables: {
      conversationId: currentId,
    },
    fetchPolicy: 'network-only',
  });

  if (messagesQuery.loading) {
    return null;
  }

  const messages = messagesQuery?.data?.imapConversationDetail || [];

  return (
    <MailConversation
      detailQuery={messagesQuery}
      conversation={currentConversation}
      conversationMessages={messages}
    />
  );
};

export default Detail;
