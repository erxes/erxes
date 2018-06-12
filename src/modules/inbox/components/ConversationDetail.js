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
import { RightSidebar, RespondBox, Resolver } from '../containers';
import Conversation from './conversation/Conversation';
import { AssignBoxPopover, Participators } from './';
import { AvatarImg } from 'modules/common/components/filterableList/styles';
import { BarItems } from 'modules/layout/styles';

import {
  PopoverButton,
  ConversationWrapper,
  AssignText,
  ActionBarLeft,
  AssignTrigger
} from '../styles';

export default class ConversationDetail extends Component {
  constructor(props) {
    super(props);

    this.state = { attachmentPreview: {} };

    this.node = React.createRef();
    this.setAttachmentPreview = this.setAttachmentPreview.bind(this);
    this.scrollBottom = this.scrollBottom.bind(this);
    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount() {
    this.scrollBottom();
  }

  // Calculating new messages's height to use later in componentDidUpdate
  // So that we can retract cursor position to original place
  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { conversationMessages } = this.props;

    if (prevProps.conversationMessages.length < conversationMessages.length) {
      const { current } = this.node;

      return current.scrollHeight - current.scrollTop;
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { conversationMessages, currentConversation } = this.props;

    const twitterData = currentConversation.twitterData;
    const isTweet = twitterData && !twitterData.isDirectMessage;

    if (isTweet) {
      return null;
    }

    const messageCount = conversationMessages.length;
    const prevMessageCount = prevProps.conversationMessages.length;

    if (snapshot !== null) {
      const { current } = this.node;
      current.scrollTop = current.scrollHeight - snapshot;
    }

    if (prevMessageCount + 1 === messageCount) {
      this.scrollBottom();
    }
  }

  onScroll() {
    const { current } = this.node;
    const { loadMoreMessages } = this.props;

    if (current.scrollTop === 0) loadMoreMessages();
  }

  scrollBottom() {
    const { current } = this.node;

    current.scrollTop = current.scrollHeight;
  }

  setAttachmentPreview(attachmentPreview) {
    this.setState({ attachmentPreview });
  }

  render() {
    const {
      currentConversation,
      conversationMessages,
      addMessage,
      loadingMessages,
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

    const content = (
      <ConversationWrapper innerRef={this.node} onScroll={this.onScroll}>
        <Conversation
          conversation={currentConversation}
          conversationMessages={conversationMessages}
          attachmentPreview={this.state.attachmentPreview}
          scrollBottom={this.scrollBottom}
          loading={loadingMessages}
        />
      </ConversationWrapper>
    );

    return (
      <div>
        {actionBar}
        {content}
        {currentConversation._id && (
          <RespondBox
            conversation={currentConversation}
            setAttachmentPreview={this.setAttachmentPreview}
            addMessage={addMessage}
          />
        )}
        {currentConversation._id && (
          <RightSidebar
            conversation={currentConversation}
            refetch={refetch}
            customerId={currentConversation.customerId}
          />
        )}
      </div>
    );
  }
}

ConversationDetail.propTypes = {
  queryParams: PropTypes.object,
  refetch: PropTypes.func,
  title: PropTypes.string,
  onFetchMore: PropTypes.func,
  currentConversationId: PropTypes.string,
  currentConversation: PropTypes.object,
  conversationMessages: PropTypes.array,
  loadingMessages: PropTypes.bool,
  loadMoreMessages: PropTypes.func,
  addMessage: PropTypes.func
};

ConversationDetail.contextTypes = {
  __: PropTypes.func
};
