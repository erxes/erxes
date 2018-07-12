import React from 'react';
import PropTypes from 'prop-types';
import striptags from 'striptags';
import { User, EngageMessage } from '../components';

const propTypes = {
  message: PropTypes.object,
  readConversation: PropTypes.func,
  showUnreadMessage: PropTypes.func,
};

class Notifier extends React.Component {
  componentDidMount() {
    this.props.showUnreadMessage();
  }

  componentDidUpdate() {
    this.props.showUnreadMessage();
  }

  renderNotificationBody() {
    const { message } = this.props;
    const { engageData, user, content } = message;
    const details = user.details || {};

    if (engageData) {
      return <EngageMessage engageData={engageData} />;
    }

    return (
      <div className="notification-wrapper">
        <div className="user-info">
          <User user={user} />
          {details.fullName}
        </div>
        <div className="notification-body">
          {striptags(content)}
        </div>
      </div>
    );
  }

  renderClass() {
    const { message } = this.props;

    if (message.engageData) {
      return `erxes-notification ${message.engageData.sentAs}`;
    }

    return 'erxes-notification';
  }

  render() {
    const { message, readConversation } = this.props;

    return (
      <div
        className={this.renderClass()}
        onClick={() => readConversation({
          conversationId: message.conversationId,
          engageData: message.engageData,
        })}
      >
        {this.renderNotificationBody()}
      </div>
    );
  }
}

Notifier.propTypes = propTypes;

export default Notifier;
