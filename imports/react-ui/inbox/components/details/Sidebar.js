import React, { PropTypes, Component } from 'react';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { Pagination, ConversationsList } from '/imports/react-ui/common';
import { Wrapper } from '/imports/react-ui/layout/components';
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
    let text = 'Resolve';
    let bsStyle = 'success';
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

  render() {
    const { Title } = Wrapper.Sidebar.Section;

    const {
      readConversations,
      unreadConversations,
      hasMore,
      loadMore,
      channelId,
      user,
      toggleBulk,
    } = this.props;

    return (
      <Wrapper.Sidebar size="wide">
        {this.renderStatusButton()}
        <Wrapper.Sidebar.Section>

          <Title>Conversations</Title>
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

        </Wrapper.Sidebar.Section>
      </Wrapper.Sidebar>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;
