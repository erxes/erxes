import React, { Component } from 'react';
import { withRouter } from 'react-router';
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
    const { history, notification, markAsRead } = this.props;

    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    history.push(notification.link);
  }

  render() {
    const { notification } = this.props;
    const { isRead, createdUser } = notification;
    const classes = classNames({ unread: !isRead });

    return (
      <li className={classes} onClick={this.markAsRead}>
        <NameCard
          user={createdUser}
          firstLine={notification.title}
          secondLine={moment(notification.date).format('DD MMM YYYY, HH:mm')}
        />
      </li>
    );
  }
}

NotificationRow.propTypes = {
  history: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired,
  markAsRead: PropTypes.func.isRequired,
  createdUser: PropTypes.object
};

export default withRouter(NotificationRow);
