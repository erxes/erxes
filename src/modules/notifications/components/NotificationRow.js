import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import { NameCard } from 'modules/common/components';

class NotificationRow extends Component {
  constructor(props) {
    super(props);

    this.markAsRead = this.markAsRead.bind(this);
  }

  markAsRead() {
    const { notification, markAsRead } = this.props;
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  }

  render() {
    const { notification, createdUser } = this.props;
    const { notifType, isRead } = notification;
    const classes = classNames({
      [notifType]: !isRead,
      unread: !isRead
    });

    return (
      <li className={classes}>
        <div onClick={this.markAsRead}>
          <NameCard
            user={createdUser}
            firstLine={notification.title}
            secondLine={moment(notification.date).format('DD MMM YYYY, HH:mm')}
          />
        </div>
      </li>
    );
  }
}

NotificationRow.propTypes = {
  notification: PropTypes.object.isRequired,
  markAsRead: PropTypes.func.isRequired,
  createdUser: PropTypes.object
};

export default NotificationRow;
