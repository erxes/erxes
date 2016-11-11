import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';
import moment from 'moment';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { NameCard } from '/imports/react-ui/common';


class NotificationListRow extends Component {
  constructor(props) {
    super(props);

    this.goNotification = this.goNotification.bind(this);
    this.toggleBulk = this.toggleBulk.bind(this);
  }

  goNotification() {
    const { notification, markAsRead } = this.props;
    markAsRead(notification._id);
    FlowRouter.go(notification.link);
  }

  toggleBulk(e) {
    const { toggleBulk, notification } = this.props;
    toggleBulk(notification._id, e.target.checked);
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
        <div className="column">
          <input type="checkbox" onChange={this.toggleBulk} />
        </div>
        <div className="body" onClick={this.goNotification}>
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

NotificationListRow.propTypes = {
  notification: PropTypes.object.isRequired,
  markAsRead: PropTypes.func.isRequired,
  createdUser: PropTypes.object,
  toggleBulk: PropTypes.func.isRequired,
};

export default NotificationListRow;
