import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  Button,
  Label,
  Icon,
  TaggerPopover,
  Tags,
  Spinner
} from 'modules/common/components';
import { LeftSidebar, RespondBox, Resolver } from '../containers';
import { AssignBoxPopover, Participators, Conversation } from './';
import { AvatarImg } from 'modules/common/components/filterableList/styles';
import { BarItems, SidebarCounter } from 'modules/layout/styles';
import ConversationDetails from './sidebar/ConversationDetails';
import { EditInformation } from 'modules/customers/containers';
import { CompanyAssociate } from 'modules/companies/containers';

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
      attachmentPreview: {}
    };

    this.setAttachmentPreview = this.setAttachmentPreview.bind(this);
    this.scrollBottom = this.scrollBottom.bind(this);
    this.scrollHalf = this.scrollHalf.bind(this);
    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount() {
    this.scrollBottom();

    this.node.addEventListener('scroll', this.onScroll);
  }

  componentDidUpdate(prevProps) {
    const { currentConversation, conversationMessages } = this.props;
    const prevConversation = prevProps.currentConversation;
    const prevConversationMessages = prevProps.conversationMessages;
    if (
      currentConversation.messageCount !== prevConversation.messageCount ||
      currentConversation._id !== prevConversation._id
    ) {
      this.scrollBottom();
    }

    if (
      conversationMessages.list !== prevConversationMessages.list &&
      this.node.scrollTop === 0
    ) {
      this.scrollHalf();
    }
  }

  scrollBottom() {
    this.node.scrollTop = this.node.scrollHeight;
  }

  scrollHalf() {
    this.node.scrollTop = this.node.scrollHeight / 2;
  }

  onScroll(e) {
    if (e.target.scrollTop === 0) {
      this.props.onFetchMore();
    }
  }

  setAttachmentPreview(attachmentPreview) {
    this.setState({ attachmentPreview });
  }

  renderMessengerData() {
    const conversation = this.props.currentConversation;
    const customer = conversation.customer || {};
    const integration = conversation.integration || {};
    const customData = customer.getMessengerCustomData;

    if (integration.kind === 'messenger' && customData.length) {
      return customData.map(data => (
        <li key={data.value}>
          {data.name}
          <SidebarCounter>{data.value}</SidebarCounter>
        </li>
      ));
    }

    return null;
  }

  renderRightSidebar(currentConversation) {
    const { loading } = this.props;

    if (currentConversation._id) {
      const customer = currentConversation.customer || {};

      return (
        <EditInformation
          conversation={currentConversation}
          sectionTop={
            <ConversationDetails conversation={currentConversation} />
          }
          sectionBottom={<CompanyAssociate data={customer} />}
          customer={customer}
          refetch={this.props.refetch}
          otherProperties={this.renderMessengerData()}
        />
      );
    }

    return <Wrapper.Sidebar full>{loading && <Spinner />}</Wrapper.Sidebar>;
  }

  render() {
    const {
      queryParams,
      currentConversationId,
      currentConversation,
      conversationMessages,
      onChangeConversation,
      refetch,
      loading
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
          <Label lblStyle="default">no tags</Label>
        )}
        <Icon icon="ios-arrow-down" />
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
        <Icon icon="ios-arrow-down" size={13} />
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
        {loading && <Spinner />}
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
        rightSidebar={this.renderRightSidebar(currentConversation)}
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
  conversationMessages: PropTypes.object,
  loading: PropTypes.bool
};

Inbox.contextTypes = {
  __: PropTypes.func
};

export default Inbox;
