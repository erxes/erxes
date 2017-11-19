import React, { Component } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import { NameCard, Tip, Icon } from 'modules/common/components';

class NotificationListRow extends Component {
  constructor(props) {
    super(props);

    this.markAsRead = this.markAsRead.bind(this);
  }

  markAsRead() {
    const { history, notification, markAsRead } = this.props;

    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    history.push(notification.link);
  }

  render() {
    const { notification } = this.props;
    const { notifType, isRead, createdUser } = notification;

    const classes = classNames({
      [notifType]: !isRead,
      unread: !isRead
    });

    return (
      <li className={classes}>
        <div className="body" onClick={this.markAsRead}>
          <NameCard
            user={createdUser}
            firstLine={notification.title}
            secondLine={moment(notification.date).format('DD MMM YYYY, HH:mm')}
          />
        </div>
        <div className="column markRead">
          <Tip text="Mark as Read">
            <span onClick={this.markAsRead}>
              <Icon icon="android-radio-button-off" />
            </span>
          </Tip>
        </div>
      </li>
    );
  }
}

NotificationListRow.propTypes = {
  history: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired,
  markAsRead: PropTypes.func.isRequired,
  createdUser: PropTypes.object
};

export default withRouter(NotificationListRow);
