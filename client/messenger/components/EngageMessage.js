import React from 'react';
import PropTypes from 'prop-types';
import striptags from 'striptags';
import { User } from '../components';

const propTypes = {
  engageData: PropTypes.object,
};

class EngageMessage extends React.Component {
  renderNotificationContent() {
    const { content, sentAs, fromUser } = this.props.engageData;
    const bodyClass = `notification-body ${sentAs}`;

    if (sentAs === 'badge') {
      return null;
    }

    return (
      <div className="flex-notification">
        <div className="user-info">
          <User user={fromUser} />
          {fromUser.details.fullName}
        </div>
        <div className={bodyClass}>
          {
            sentAs === 'fullMessage' ?
              <span dangerouslySetInnerHTML={{ __html: content }} /> :
              striptags(content)
          }
        </div>
      </div>
    );
  }

  render() {
    return this.renderNotificationContent();
  }
}

EngageMessage.propTypes = propTypes;

export default EngageMessage;
