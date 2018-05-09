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

    this.state = { attachmentPreview: {} };

    this.setAttachmentPreview = this.setAttachmentPreview.bind(this);
    this.scrollBottom = this.scrollBottom.bind(this);
  }

  componentDidMount() {
    this.scrollBottom();
  }

  componentDidUpdate() {
    const twitterData = this.props.currentConversation.twitterData;
    const isTweet = twitterData && !twitterData.isDirectMessage;

    if (!isTweet) {
      this.scrollBottom();
    }
  }

  scrollBottom() {
    this.node.scrollTop = this.node.scrollHeight;
  }

  setAttachmentPreview(attachmentPreview) {
    this.setState({ attachmentPreview });
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

    const content = (
      <ConversationWrapper
        innerRef={node => {
          this.node = node;
        }}
      >
        <Conversation
          conversation={currentConversation}
          conversationMessages={conversationMessages}
          attachmentPreview={this.state.attachmentPreview}
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
          <RightSidebar
            conversation={currentConversation}
            refetch={refetch}
            customerId={currentConversation.customerId}
          />
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
  sectionParams: PropTypes.object,
  setSectionParams: PropTypes.func
};

Inbox.contextTypes = {
  __: PropTypes.func
};

export default Inbox;
