import React from 'react';
import PropTypes from 'prop-types';
import striptags from 'striptags';
import { User, EngageMessage } from '../components';

const propTypes = {
  lastUnreadMessage: PropTypes.object,
  readConversation: PropTypes.func,
  showUnreadMessage: PropTypes.func,
  color: PropTypes.string,
};

class Notifier extends React.Component {
  componentDidMount() {
    this.props.showUnreadMessage();
  }

  componentDidUpdate() {
    this.props.showUnreadMessage();
  }

  renderNotificationBody() {
    const { lastUnreadMessage } = this.props;
    const { engageData, user, content } = lastUnreadMessage;
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
    const { lastUnreadMessage } = this.props;

    if (lastUnreadMessage.engageData) {
      return `erxes-notification ${lastUnreadMessage.engageData.sentAs}`;
    }

    return 'erxes-notification';
  }

  render() {
    const { lastUnreadMessage, readConversation, color } = this.props;

    if (lastUnreadMessage._id) {
      return (
        <div
          className={this.renderClass()}
          style={{ borderColor: color }}
          onClick={() => readConversation({
            conversationId: lastUnreadMessage.conversationId,
            engageData: lastUnreadMessage.engageData,
          })}
        >
          {this.renderNotificationBody()}
        </div>
      );
    }

    return null;
  }
}

Notifier.propTypes = propTypes;

export default Notifier;
