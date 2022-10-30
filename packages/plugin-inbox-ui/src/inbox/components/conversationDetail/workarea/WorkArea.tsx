import React from 'react';

import { IAttachmentPreview } from '@erxes/ui/src/types';
import { ContenFooter, ContentBox } from '@erxes/ui/src/layout/styles';

import { __ } from 'coreui/utils';
import RespondBox from '../../../containers/conversationDetail/RespondBox';
import {
  AddMessageMutationVariables,
  IConversation,
  IMessage
} from '@erxes/ui-inbox/src/inbox/types';
import Conversation from './conversation/Conversation';
import { ConversationWrapper } from './styles';
import TypingIndicator from './TypingIndicator';
import { isEnabled, loadDynamicComponent } from '@erxes/ui/src/utils/core';
import ActionBar from './ActionBar';

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
  private node;

  constructor(props: Props) {
    super(props);

    this.state = { attachmentPreview: null };

    this.node = React.createRef();
  }

  componentDidMount() {
    this.scrollBottom();
  }

  // Calculating new messages's height to use later in componentDidUpdate
  // So that we can retract cursor position to original place
  getSnapshotBeforeUpdate(prevProps) {
    const { conversationMessages } = this.props;

    if (prevProps.conversationMessages.length < conversationMessages.length) {
      const { current } = this.node;

      if (current) {
        return current.scrollHeight - current.scrollTop;
      }
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { conversationMessages, typingInfo } = this.props;

    const messageCount = conversationMessages.length;
    const prevMessageCount = prevProps.conversationMessages.length;

    if (snapshot !== null) {
      const { current } = this.node;

      if (current) {
        current.scrollTop = current.scrollHeight - snapshot;
      }
    }

    if (prevMessageCount + 1 === messageCount || typingInfo) {
      this.scrollBottom();
    }

    return;
  }

  onScroll = () => {
    const { current } = this.node;
    const { loadMoreMessages } = this.props;

    if (current.scrollTop === 0) {
      loadMoreMessages();
    }
  };

  scrollBottom = () => {
    const { current } = this.node;

    if (current) {
      return (current.scrollTop = current.scrollHeight);
    }
  };

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
      refetchDetail
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

    let content = (
      <ConversationWrapper
        id="conversationWrapper"
        innerRef={this.node}
        onScroll={this.onScroll}
      >
        <Conversation
          conversation={currentConversation}
          scrollBottom={this.scrollBottom}
          conversationMessages={conversationMessages}
          attachmentPreview={this.state.attachmentPreview}
          loading={loading}
        />
      </ConversationWrapper>
    );

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

    if (
      ![
        'messenger',
        'facebook-post',
        'lead',
        'booking',
        'webhook',
        'callpro'
      ].includes(currentConversation.integration.kind)
    ) {
      content = loadDynamicComponent('inboxConversationDetail', {
        ...this.props
      });
    }

    return (
      <>
        <ActionBar
          currentConversation={currentConversation}
          conversationMessages={conversationMessages}
        />
        <ContentBox>{content}</ContentBox>
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
