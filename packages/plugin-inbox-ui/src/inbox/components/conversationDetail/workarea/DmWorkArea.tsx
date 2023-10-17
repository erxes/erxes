import {
  AddMessageMutationVariables,
  IConversation,
  IMessage
} from '@erxes/ui-inbox/src/inbox/types';
import { ContenFooter, ContentBox } from '@erxes/ui/src/layout/styles';
import {
  ConversationWrapper,
  MailSubject,
  RenderConversationWrapper
} from './styles';

import ActionBar from './ActionBar';
import CallPro from './callpro/Callpro';
import { IAttachmentPreview } from '@erxes/ui/src/types';
import MailConversation from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/mail/MailConversation';
import Message from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/messages/Message';
import React from 'react';
import RespondBox from '../../../containers/conversationDetail/RespondBox';
import TypingIndicator from './TypingIndicator';
import { __ } from 'coreui/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';

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
  content?: any;
};

type State = {
  attachmentPreview: IAttachmentPreview;
  keysPressed: any;
  showInternalState: boolean;
};

export default class WorkArea extends React.Component<Props, State> {
  private node;

  constructor(props: Props) {
    super(props);

    this.state = {
      attachmentPreview: null,
      keysPressed: {},
      showInternalState: false
    };

    this.node = React.createRef();
  }

  componentDidMount() {
    this.scrollBottom();
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  handleKeyDown = (event: any) => {
    const { keysPressed } = this.state;
    const key = event.key;

    this.setState({ keysPressed: { ...keysPressed, [key]: true } }, () => {
      if (
        this.state.keysPressed.Control === true &&
        this.state.keysPressed.i === true
      ) {
        this.setState({ showInternalState: !this.state.showInternalState });
      }
    });
  };

  handleKeyUp = (event: any) => {
    delete this.state.keysPressed[event.key];

    this.setState({ keysPressed: { ...this.state.keysPressed } });
  };

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

  componentDidUpdate(prevProps, _prevState, snapshot) {
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

  renderExtraHeading = (kind: string, conversationMessage: IMessage) => {
    if (!conversationMessage) {
      return null;
    }

    if (this.isMailConversation(kind)) {
      const { mailData } = conversationMessage;

      return <MailSubject>{mailData && (mailData.subject || '')}</MailSubject>;
    }

    return null;
  };

  renderMessages(messages: IMessage[], conversationFirstMessage: IMessage) {
    const rows: React.ReactNode[] = [];

    let tempId;

    messages.forEach(message => {
      rows.push(
        <Message
          isSameUser={
            message.userId
              ? message.userId === tempId
              : message.customerId === tempId
          }
          conversationFirstMessage={conversationFirstMessage}
          message={message}
          key={message._id}
        />
      );

      tempId = message.userId ? message.userId : message.customerId;
    });

    return rows;
  }

  renderConversation() {
    const { currentConversation, conversationMessages, content } = this.props;

    if (!currentConversation) {
      return null;
    }

    const messages = (conversationMessages || []).slice();
    const firstMessage = messages[0];

    const { integration } = currentConversation;
    const kind = integration && integration.kind.split('-')[0];

    if (kind === 'callpro') {
      return (
        <>
          <CallPro conversation={currentConversation} />
          {this.renderMessages(messages, firstMessage)}
        </>
      );
    }

    if (kind.includes('nylas') || kind === 'gmail') {
      return (
        <MailConversation
          conversation={currentConversation}
          conversationMessages={conversationMessages}
        />
      );
    }

    if (kind === 'imap') {
      return (
        <>
          {content}
          {isEnabled('internalnotes') &&
            this.renderMessages(messages, firstMessage)}
        </>
      );
    }

    return this.renderMessages(messages, firstMessage);
  }

  render() {
    const {
      currentConversation,
      addMessage,
      typingInfo,
      refetchMessages,
      refetchDetail
    } = this.props;

    const { kind } = currentConversation.integration;
    const { keysPressed } = this.state;

    const showInternal =
      this.isMailConversation(kind) ||
      kind === 'lead' ||
      kind === 'booking' ||
      kind === 'imap' ||
      kind === 'webhook';

    const typingIndicator = typingInfo ? (
      <TypingIndicator>{typingInfo}</TypingIndicator>
    ) : null;

    const respondBox = () => {
      const data = (
        <RespondBox
          showInternal={
            isEnabled('internalnotes')
              ? showInternal
                ? true
                : this.state.showInternalState
              : false
          }
          conversation={currentConversation}
          setAttachmentPreview={this.setAttachmentPreview}
          addMessage={addMessage}
          refetchMessages={refetchMessages}
          refetchDetail={refetchDetail}
        />
      );

      if (kind === 'imap') {
        return isEnabled('internalnotes') && data;
      }

      return data;
    };

    return (
      <>
        <ActionBar currentConversation={currentConversation} />

        <ContentBox>
          <ConversationWrapper
            id="conversationWrapper"
            innerRef={this.node}
            onScroll={this.onScroll}
          >
            <RenderConversationWrapper>
              {this.renderConversation()}
            </RenderConversationWrapper>
          </ConversationWrapper>
        </ContentBox>

        {currentConversation._id && (
          <ContenFooter>
            {typingIndicator}
            {respondBox()}
          </ContenFooter>
        )}
      </>
    );
  }
}
