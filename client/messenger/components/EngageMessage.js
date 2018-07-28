import { Component, Fragment } from 'react';
import * as PropTypes from 'prop-types';
import * as striptags from 'striptags';
import { User } from '../components';
import { iconClose } from '../../icons/Icons';

const propTypes = {
  engageData: PropTypes.object,
  toggle: PropTypes.func,
};

class EngageMessage extends Component {
  renderClose() {
    return (
      <a
        href="#"
        className="close-notification"
        onClick={this.props.toggle}
        title="Close notification"
      >
        {iconClose}
      </a>
    );
  }

  renderNotificationContent() {
    const { content, sentAs, fromUser } = this.props.engageData;
    const bodyClass = `notification-body ${sentAs}`;

    if (sentAs === 'badge') {
      return null;
    }

    return (
      <Fragment>
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
        {this.renderClose()}
      </Fragment>
    );
  }

  render() {
    return this.renderNotificationContent();
  }
}

EngageMessage.propTypes = propTypes;

export default EngageMessage;
