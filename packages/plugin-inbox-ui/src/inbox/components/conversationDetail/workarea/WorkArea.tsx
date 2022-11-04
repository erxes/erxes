import React from 'react';

import { IAttachmentPreview } from '@erxes/ui/src/types';
import { ContenFooter } from '@erxes/ui/src/layout/styles';

import { __ } from 'coreui/utils';
import RespondBox from '../../../containers/conversationDetail/RespondBox';
import {
  AddMessageMutationVariables,
  IConversation,
  IMessage
} from '@erxes/ui-inbox/src/inbox/types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import TypingIndicator from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/TypingIndicator';

import ActionBar from './ActionBar';
import Content from './Content';

type Props = {
  queryParams?: any;
  title?: string;
  currentConversationId?: string;
  currentConversation: IConversation;
  conversationMessages: IMessage[];
  loading: boolean;
  typingInfo?: string;
  loadMoreMessages: () => void;
  addMessage: ({
    variables,
    optimisticResponse,
    callback,
    kind
  }: {
    variables: AddMessageMutationVariables;
    optimisticResponse: any;
    callback?: (e?) => void;
    kind: string;
  }) => void;
  refetchMessages: () => void;
  refetchDetail: () => void;
};

type State = {
  attachmentPreview: IAttachmentPreview;
};

export default class WorkArea extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { attachmentPreview: null };
  }

  setAttachmentPreview = attachmentPreview => {
    this.setState({ attachmentPreview });
  };

  isMailConversation = (kind: string) =>
    kind.includes('nylas') || kind === 'gmail' ? true : false;

  render() {
    const {
      currentConversation,
      conversationMessages,
      addMessage,
      loading,
      typingInfo,
      refetchMessages,
      refetchDetail,
      loadMoreMessages
    } = this.props;

    const { kind } = currentConversation.integration;

    const showInternal =
      this.isMailConversation(kind) ||
      kind === 'lead' ||
      kind === 'booking' ||
      kind === 'webhook';

    const typingIndicator = typingInfo ? (
      <TypingIndicator>{typingInfo}</TypingIndicator>
    ) : null;

    const respondBox = (
      <RespondBox
        showInternal={isEnabled('internalnotes') ? showInternal : false}
        conversation={currentConversation}
        setAttachmentPreview={this.setAttachmentPreview}
        addMessage={addMessage}
        refetchMessages={refetchMessages}
        refetchDetail={refetchDetail}
      />
    );

    return (
      <>
        <ActionBar
          currentConversation={currentConversation}
          conversationMessages={conversationMessages}
        />
        <Content
          currentConversation={currentConversation}
          conversationMessages={conversationMessages}
          loading={loading}
          attachmentPreview={this.state.attachmentPreview}
          loadMoreMessages={loadMoreMessages}
          typingInfo={typingInfo}
        />
        {currentConversation._id && (
          <ContenFooter>
            {typingIndicator}
            {respondBox}
          </ContenFooter>
        )}
      </>
    );
  }
}
