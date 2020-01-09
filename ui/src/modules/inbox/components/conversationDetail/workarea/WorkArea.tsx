import asyncComponent from 'modules/common/components/AsyncComponent';
import Button from 'modules/common/components/Button';
import { AvatarImg } from 'modules/common/components/filterableList/styles';
import Icon from 'modules/common/components/Icon';
import Label from 'modules/common/components/Label';
import Tags from 'modules/common/components/Tags';
import { IAttachmentPreview } from 'modules/common/types';
import { __, getUserAvatar } from 'modules/common/utils';
import AssignBoxPopover from 'modules/inbox/components/assignBox/AssignBoxPopover';
import RespondBox from 'modules/inbox/containers/conversationDetail/RespondBox';
import Resolver from 'modules/inbox/containers/Resolver';
import Tagger from 'modules/inbox/containers/Tagger';
import { PopoverButton } from 'modules/inbox/styles';
import Wrapper from 'modules/layout/components/Wrapper';
import { ContenFooter, ContentBox } from 'modules/layout/styles';
import { BarItems } from 'modules/layout/styles';
import React from 'react';
import {
  AddMessageMutationVariables,
  IConversation,
  IMessage
} from '../../../types';
import Conversation from './conversation/Conversation';
import {
  ActionBarLeft,
  AssignText,
  AssignTrigger,
  ConversationWrapper,
  MailSubject
} from './styles';
import TypingIndicator from './TypingIndicator';

const Participators = asyncComponent(
  () => import(/* webpackChunkName:"Inbox-Participators" */ './Participators'),
  { height: '30px', width: '30px', round: true }
);

const ConvertTo = asyncComponent(
  () =>
    import(/* webpackChunkName:"Inbox-ConvertTo" */ '../../../containers/conversationDetail/workarea/ConvertTo'),
  { height: '22px', width: '100px', marginRight: '10px' }
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
  addMessage: (
    {
      variables,
      optimisticResponse,
      callback,
      kind
    }: {
      variables: AddMessageMutationVariables;
      optimisticResponse: any;
      callback?: (e?) => void;
      kind: string;
    }
  ) => void;
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
      typingInfo
    } = this.props;

    const tags = currentConversation.tags || [];
    const assignedUser = currentConversation.assignedUser;
    const participatedUsers = currentConversation.participatedUsers || [];
    const { kind } = currentConversation.integration;

    const showInternal = this.isMailConversation(kind) || kind === 'lead';

    const tagTrigger = (
      <PopoverButton>
        {tags.length ? (
          <Tags tags={tags} limit={1} />
        ) : (
          <Label lblStyle="default">No tags</Label>
        )}
        <Icon icon="angle-down" />
      </PopoverButton>
    );

    const assignTrigger = (
      <AssignTrigger>
        {assignedUser && assignedUser._id ? (
          <AvatarImg src={getUserAvatar(assignedUser)} />
        ) : (
          <Button btnStyle="simple" size="small">
            {__('Member')}
            <Icon icon="angle-down" />
          </Button>
        )}
      </AssignTrigger>
    );

    const actionBarRight = (
      <BarItems>
        <Tagger targets={[currentConversation]} trigger={tagTrigger} />

        <ConvertTo conversation={currentConversation} />

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
        background="colorWhite"
        bottom={this.renderExtraHeading(kind, conversationMessages[0])}
      />
    );

    const typingIndicator = typingInfo ? (
      <TypingIndicator>{typingInfo}</TypingIndicator>
    ) : null;

    const content = (
      <ConversationWrapper innerRef={this.node} onScroll={this.onScroll}>
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
              showInternal={showInternal}
              conversation={currentConversation}
              setAttachmentPreview={this.setAttachmentPreview}
              addMessage={addMessage}
            />
          </ContenFooter>
        )}
      </>
    );
  }
}
