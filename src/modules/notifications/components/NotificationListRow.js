import React, { Component } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import { NameCard, Tip, Icon } from 'modules/common/components';
import { MarkRead, NotifBody } from './styles';

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
    const { __ } = this.context;
    const { notification } = this.props;
    const { isRead, createdUser } = notification;

    const classes = classNames({ unread: !isRead });

    return (
      <li className={classes}>
        <NotifBody onClick={this.markAsRead}>
          <NameCard
            user={createdUser}
            firstLine={notification.title}
            secondLine={moment(notification.date).format('DD MMM YYYY, HH:mm')}
          />
        </NotifBody>
        <MarkRead>
          <Tip text={__('Mark as read')}>
            <span onClick={this.markAsRead}>
              <Icon icon="android-radio-button-off" />
            </span>
          </Tip>
        </MarkRead>
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

NotificationListRow.contextTypes = {
  __: PropTypes.func
};

export default withRouter(NotificationListRow);
