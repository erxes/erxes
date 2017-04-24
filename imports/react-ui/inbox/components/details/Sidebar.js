import React, { PropTypes, Component } from 'react';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import {
  Pagination,
  ConversationsList,
  LoadingContent,
  EmptyState,
} from '/imports/react-ui/common';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Resolver } from '../../containers';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';

const propTypes = {
  conversation: PropTypes.object.isRequired,
  changeStatus: PropTypes.func.isRequired,
  readConversations: PropTypes.array.isRequired,
  unreadConversations: PropTypes.array.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  channelId: PropTypes.string,
  bulk: PropTypes.array.isRequired,
  toggleBulk: PropTypes.func.isRequired,
  emptyBulk: PropTypes.func.isRequired,
  user: PropTypes.object,
  conversationReady: PropTypes.bool,
};

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // current conversation is open or closed
      status: props.conversation.status,
    };

    this.changeStatus = this.changeStatus.bind(this);
  }

  // change resolved status
  changeStatus() {
    let status = CONVERSATION_STATUSES.CLOSED;

    if (this.state.status === CONVERSATION_STATUSES.CLOSED) {
      status = CONVERSATION_STATUSES.OPEN;
    }

    this.setState({ status });

    // call change status method
    this.props.changeStatus(this.props.conversation._id, status, () => {
      if (this.state.status === CONVERSATION_STATUSES.CLOSED) {
        Alert.success('The conversation has been resolved!');
      } else {
        Alert.info('The conversation has been reopened and restored to Inbox.');
      }
    });
  }

  renderStatusButton() {
    const { bulk, emptyBulk } = this.props;
    let bsStyle = 'success';

    if (bulk.length !== 0) {
      return (
        <Resolver
          conversations={bulk}
          afterSave={emptyBulk}
          resolveText="Resolve selected"
          bsStyle={bsStyle}
        />
      );
    }

    let text = 'Resolve';
    let icon = <i className="ion-checkmark-circled" />;

    if (this.state.status === CONVERSATION_STATUSES.CLOSED) {
      text = 'Open';
      bsStyle = 'warning';
      icon = <i className="ion-refresh" />;
    }

    return (
      <Button bsStyle={bsStyle} onClick={this.changeStatus} className="action-btn">
        {icon} {text}
      </Button>
    );
  }

  renderSidebarContent() {
    const {
      readConversations,
      unreadConversations,
      hasMore,
      loadMore,
      channelId,
      user,
      toggleBulk,
      conversationReady,
    } = this.props;

    if (unreadConversations.length === 0 && readConversations.length === 0 && conversationReady) {
      return (
        <EmptyState
          text="There aren’t any conversations."
          size="small"
          icon={<i className="ion-email" />}
        />
      );
    } else if (!conversationReady) {
      return <LoadingContent items={5} />;
    }

    return (
      <Pagination hasMore={hasMore} loadMore={loadMore}>
        <ConversationsList
          conversations={unreadConversations}
          user={user}
          toggleBulk={toggleBulk}
          channelId={channelId}
          simple
        />
        <ConversationsList
          conversations={readConversations}
          user={user}
          toggleBulk={toggleBulk}
          channelId={channelId}
          simple
        />
      </Pagination>
    );
  }

  render() {
    const { Title } = Wrapper.Sidebar.Section;

    return (
      <Wrapper.Sidebar size="wide" fixedContent={this.renderStatusButton()}>
        <Wrapper.Sidebar.Section className="full">
          <Title>Conversations</Title>
          {this.renderSidebarContent()}
        </Wrapper.Sidebar.Section>
      </Wrapper.Sidebar>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;
