import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';
import moment from 'moment';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { NameCard, Tip } from '/imports/react-ui/common';


class NotificationListRow extends Component {
  constructor(props) {
    super(props);

    this.goNotification = this.goNotification.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
  }

  goNotification() {
    const { notification } = this.props;
    this.markAsRead();
    FlowRouter.go(notification.link);
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
      unread: !isRead,
    });

    return (
      <li className={classes}>
        <div className="body" onClick={this.goNotification}>
          <NameCard
            user={createdUser}
            firstLine={notification.title}
            secondLine={moment(notification.date).format('DD MMM YYYY, HH:mm')}
          />
        </div>
        <div className="column markRead">
          <Tip text="Mark as Read">
            <span onClick={this.markAsRead}>
              <i className="ion-android-radio-button-off"></i>
            </span>
          </Tip>
        </div>
      </li>
    );
  }
}

NotificationListRow.propTypes = {
  notification: PropTypes.object.isRequired,
  markAsRead: PropTypes.func.isRequired,
  createdUser: PropTypes.object,
};

export default NotificationListRow;
