import { IConversation, IMessage } from '@erxes/ui-inbox/src/inbox/types';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';
import styled from 'styled-components';

const Container = styled.div`
  display: inline-block;
`;

type Props = {
  conversation: IConversation;
  conversationMessage: IMessage;
  PostInfo: any;
};

export default function Post(props: Props) {
  const { PostInfo } = props;

  return (
    <Container>
      <a href={PostInfo.permalink_url} target="_blank" rel="noreferrer">
        {__('go to post')}
      </a>
    </Container>
  );
}
