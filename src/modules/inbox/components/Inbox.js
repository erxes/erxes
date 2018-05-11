import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  Button,
  Label,
  Icon,
  TaggerPopover,
  Tags
} from 'modules/common/components';
import { LeftSidebar, RightSidebar, RespondBox, Resolver } from '../containers';
import { AssignBoxPopover, Participators, Conversation } from './';
import { AvatarImg } from 'modules/common/components/filterableList/styles';
import { BarItems } from 'modules/layout/styles';

import {
  PopoverButton,
  ConversationWrapper,
  AssignText,
  ActionBarLeft,
  AssignTrigger
} from '../styles';

class Inbox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      attachmentPreview: {},
      messages: null,
      loadingMore: false,
      currentId: props.currentId
    };

    this.node = React.createRef();
    this.setAttachmentPreview = this.setAttachmentPreview.bind(this);
    this.scrollBottom = this.scrollBottom.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.handleResultsFound = this.handleResultsFound.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { currentId } = nextProps;

    if (currentId !== prevState.currentId) {
      return { messages: null, currentId };
    }

    return null;
  }

  componentDidMount() {
    this.scrollBottom();
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { messages } = prevState;

    if (messages && messages.length < this.state.messages.length) {
      const { current } = this.node;

      return current.scrollHeight - current.scrollTop;
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { conversationMessages, currentConversation } = this.props;
    const { twitterData } = currentConversation;
    const isTweet = twitterData && !twitterData.isDirectMessage;

    const { current } = this.node;
    const messageList = current.firstChild;

    if (!isTweet) {
      this.scrollBottom();
    }

    if (snapshot !== null) {
      const { current } = this.node;
      current.scrollTop = current.scrollHeight - snapshot;
    }

    if (
      current.scrollHeight > messageList.scrollHeight &&
      messageList.scrollHeight > conversationMessages.length * 40 &&
      conversationMessages.length > 0 &&
      !this.state.loadingMore
    ) {
      this.loadMore();
    }
  }

  onScroll() {
    const { current } = this.node;

    if (current.scrollTop === 0) this.loadMore();
  }

  scrollBottom() {
    const { current } = this.node;
    const { messages } = this.state;

    if (!messages) {
      current.scrollTop = current.scrollHeight;
    }
  }

  setAttachmentPreview(attachmentPreview) {
    this.setState({ attachmentPreview });
  }

  loadMore() {
    const {
      loadMoreMessages,
      conversationMessages,
      currentId,
      messagesTotalCount
    } = this.props;

    const messages = this.state.messages || conversationMessages;

    if (
      currentId === this.state.currentId &&
      messages.length === messagesTotalCount
    )
      return;

    const limit = messages.length + 1;
    const variables = { conversationId: currentId, limit };

    this.setState({ loadingMore: true });
    loadMoreMessages(variables, this.handleResultsFound);
  }

  handleResultsFound(messages) {
    this.setState({ messages, loadingMore: false });
  }

  render() {
    const {
      queryParams,
      currentConversationId,
      currentConversation,
      conversationMessages,
      onChangeConversation,
      refetch
    } = this.props;

    const { __ } = this.context;
    const tags = currentConversation.tags || [];
    const assignedUser = currentConversation.assignedUser;
    const participatedUsers = currentConversation.participatedUsers || [];

    const tagTrigger = (
      <PopoverButton>
        {tags.length ? (
          <Tags tags={tags} limit={1} />
        ) : (
          <Label lblStyle="default">No tags</Label>
        )}
        <Icon icon="downarrow" />
      </PopoverButton>
    );

    const assignTrigger = (
      <AssignTrigger>
        {assignedUser && assignedUser._id ? (
          <AvatarImg
            src={assignedUser.details.avatar || '/images/avatar-colored.svg'}
          />
        ) : (
          <Button btnStyle="simple" size="small">
            Member
          </Button>
        )}
        <Icon icon="downarrow" />
      </AssignTrigger>
    );

    const actionBarRight = (
      <BarItems>
        <TaggerPopover
          targets={[currentConversation]}
          type="conversation"
          trigger={tagTrigger}
          afterSave={refetch}
        />

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
      />
    );

    const { messages, attachmentPreview } = this.state;
    const content = (
      <ConversationWrapper innerRef={this.node} onScroll={this.onScroll}>
        <Conversation
          conversation={currentConversation}
          conversationMessages={messages || conversationMessages}
          attachmentPreview={attachmentPreview}
          scrollBottom={this.scrollBottom}
        />
      </ConversationWrapper>
    );

    const breadcrumb = [{ title: __('Inbox') }];

    return (
      <Wrapper
        header={
          <Wrapper.Header queryParams={queryParams} breadcrumb={breadcrumb} />
        }
        actionBar={actionBar}
        content={content}
        footer={
          currentConversation._id && (
            <RespondBox
              conversation={currentConversation}
              setAttachmentPreview={this.setAttachmentPreview}
            />
          )
        }
        leftSidebar={
          <LeftSidebar
            queryParams={queryParams}
            currentConversationId={currentConversationId}
            onChangeConversation={onChangeConversation}
          />
        }
        rightSidebar={
          currentConversation._id && (
            <RightSidebar
              conversation={currentConversation}
              refetch={refetch}
              customerId={currentConversation.customerId}
            />
          )
        }
      />
    );
  }
}

Inbox.propTypes = {
  queryParams: PropTypes.object,
  refetch: PropTypes.func,
  title: PropTypes.string,
  onFetchMore: PropTypes.func,
  onChangeConversation: PropTypes.func,
  currentConversationId: PropTypes.string,
  currentConversation: PropTypes.object,
  conversationMessages: PropTypes.array,
  loading: PropTypes.bool,
  currentId: PropTypes.string,
  loadMoreMessages: PropTypes.func,
  messagesTotalCount: PropTypes.number
};

Inbox.contextTypes = {
  __: PropTypes.func
};

export default Inbox;
