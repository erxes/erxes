import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';

const propTypes = {
  conversation: PropTypes.object.isRequired,
  messagesCount: PropTypes.number.isRequired,
  changeStatus: PropTypes.func.isRequired,
};

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedIntegration: FlowRouter.getQueryParam('integrationType') || 'All Integrations',
    };

    this.changeStatus = this.changeStatus.bind(this);
  }

  // change resolved status
  changeStatus() {
    let status = this.props.conversation.status;

    if (status === CONVERSATION_STATUSES.CLOSED) {
      status = CONVERSATION_STATUSES.OPEN;
    } else {
      status = CONVERSATION_STATUSES.CLOSED;
    }

    // call change status method
    this.props.changeStatus(this.props.conversation._id, status, () => {
      if (status === CONVERSATION_STATUSES.CLOSED) {
        Alert.success('The conversation has been resolved!');
      } else {
        Alert.info('The conversation has been reopened and restored to Inbox.');
      }
    });
  }

  renderStatusButton() {
    let bsStyle = 'success';
    let text = 'Resolve';
    let icon = <i className="ion-checkmark-circled" />;

    if (this.props.conversation.status === CONVERSATION_STATUSES.CLOSED) {
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

  renderFacebookPostUrl() {
    const conversation = this.props.conversation;
    const integration = conversation.integration || {};

    if (integration.kind === 'facebook' && conversation.facebookData.kind === 'feed') {
      const link = `http://facebook.com/${conversation.facebookData.postId}`;
      return (
        <li>
          Facebook URL
          <span className="counter">
            <a target="_blank" href={link} rel="noopener noreferrer">
              [view]
            </a>
          </span>
        </li>
      );
    }

    return null;
  }

  render() {
    const Sidebar = Wrapper.Sidebar;

    const { Title } = Wrapper.Sidebar.Section;
    const { conversation, messagesCount } = this.props;
    const { integration = {} } = conversation;
    const { brand = {}, channels = [] } = integration;

    return (
      <Sidebar fixedContent={this.renderStatusButton()}>
        <Wrapper.Sidebar.Section>
          <Title>Conversation Details</Title>

          <ul className="sidebar-list no-link">
            <li>
              Opened
              <span className="counter">{moment(conversation.createdAt).fromNow()}</span>
            </li>
            <li>
              Channels
              <div className="value">
                {channels.map(c => (
                  <span key={c._id}>
                    {c.name}
                  </span>
                ))}
              </div>
            </li>
            <li>
              Brand
              <span className="counter">{brand.name}</span>
            </li>
            <li>
              Integration
              <span className="counter">{integration.kind}</span>
            </li>
            <li>
              Conversations
              <span className="counter">{messagesCount}</span>
            </li>
            {this.renderFacebookPostUrl()}
          </ul>
        </Wrapper.Sidebar.Section>
      </Sidebar>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;
