import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import Button from '@erxes/ui/src/components/Button';
import { AvatarImg } from '@erxes/ui/src/components/filterableList/styles';
import Icon from '@erxes/ui/src/components/Icon';
import Label from '@erxes/ui/src/components/Label';
import Tags from '@erxes/ui/src/components/Tags';
import { IAttachmentPreview } from '@erxes/ui/src/types';
import { __, getUserAvatar } from 'coreui/utils';
import AssignBoxPopover from '../../assignBox/AssignBoxPopover';
import RespondBox from '../../../containers/conversationDetail/RespondBox';
import Resolver from '../../../containers/Resolver';
import Tagger from '../../../containers/Tagger';
import { PopoverButton } from '@erxes/ui-inbox/src/inbox/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import {
  ContenFooter,
  ContentBox,
  BarItems
} from '@erxes/ui/src/layout/styles';
import React from 'react';
import {
  AddMessageMutationVariables,
  IConversation,
  IMessage
} from '@erxes/ui-inbox/src/inbox/types';
import Conversation from './conversation/Conversation';
import {
  ActionBarLeft,
  AssignText,
  AssignTrigger,
  ConversationWrapper,
  MailSubject
} from './styles';
import TypingIndicator from './TypingIndicator';
import { isEnabled } from "@erxes/ui/src/utils/core";

const Participators = asyncComponent(
  () => import(/* webpackChunkName:"Inbox-Participators" */ '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/Participators'),
  { height: '30px', width: '30px', round: true }
);

const ConvertTo = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-ConvertTo" */ '../../../containers/conversationDetail/workarea/ConvertTo'
    ),
  { height: '22px', width: '71px' }
);

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

      return current.scrollHeight - current.scrollTop;
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { conversationMessages, typingInfo } = this.props;

    const messageCount = conversationMessages.length;
    const prevMessageCount = prevProps.conversationMessages.length;

    if (snapshot !== null) {
      const { current } = this.node;
      current.scrollTop = current.scrollHeight - snapshot;
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

    return (current.scrollTop = current.scrollHeight);
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

    const tags = currentConversation.tags || [];
    const assignedUser = currentConversation.assignedUser;
    const participatedUsers = currentConversation.participatedUsers || [];
    const { kind } = currentConversation.integration;

    const showInternal =
      this.isMailConversation(kind) ||
      kind === 'lead' ||
      kind === 'booking' ||
      kind === 'webhook';

    const tagTrigger = (
      <PopoverButton id='conversationTags'>
        {tags.length ? (
          <Tags tags={tags} limit={1} />
        ) : (
          <Label lblStyle='default'>No tags</Label>
        )}
        <Icon icon='angle-down' />
      </PopoverButton>
    );

    const assignTrigger = (
      <AssignTrigger id='conversationAssignTrigger'>
        {assignedUser && assignedUser._id ? (
          <AvatarImg src={getUserAvatar(assignedUser)} />
        ) : (
          <Button id='conversationAssignTo' btnStyle='simple' size='small'>
            {__('Member')}
            <Icon icon='angle-down' />
          </Button>
        )}
      </AssignTrigger>
    );

    const actionBarRight = (
      <BarItems>
        {isEnabled("tags") &&
          <Tagger targets={[currentConversation]} trigger={tagTrigger} />
        }
        {isEnabled("cards") && 
          <ConvertTo
            conversation={currentConversation}
            conversationMessage={
              kind.includes('nylas') || kind === 'gmail'
                ? conversationMessages[0]
                : {}
            }
          />
        }

        <Resolver conversations={[currentConversation]} />
      </BarItems>
    );

    const actionBarLeft = (
      <ActionBarLeft>
        <AssignText>{__('Assign to')}:</AssignText>
        <AssignBoxPopover
          targets={[currentConversation]}
          trigger={assignTrigger}
        />
        {participatedUsers && (
          <Participators participatedUsers={participatedUsers} limit={3} />
        )}
      </ActionBarLeft>
    );

    const actionBar = (
      <Wrapper.ActionBar
        right={actionBarRight}
        left={actionBarLeft}
        background='colorWhite'
        bottom={this.renderExtraHeading(kind, conversationMessages[0])}
      />
    );

    const typingIndicator = typingInfo ? (
      <TypingIndicator>{typingInfo}</TypingIndicator>
    ) : null;

    const content = (
      <ConversationWrapper
        id='conversationWrapper'
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

    return (
      <>
        {actionBar}
        <ContentBox>{content}</ContentBox>
        {currentConversation._id && (
          <ContenFooter>
            {typingIndicator}
            <RespondBox
              showInternal={isEnabled("internalnotes") ? showInternal : false}
              conversation={currentConversation}
              setAttachmentPreview={this.setAttachmentPreview}
              addMessage={addMessage}
              refetchMessages={refetchMessages}
              refetchDetail={refetchDetail}
            />
          </ContenFooter>
        )}
      </>
    );
  }
}
