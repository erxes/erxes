import React, { PropTypes } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Scrollbars } from 'react-custom-scrollbars';
import { EmptyState } from '/imports/react-ui/common';
import { NotificationRow } from '../../containers';


function NotificationsLatest({ notifications }) {
  const notifCount = notifications.length;

  let seeAll = <a href={FlowRouter.path('/notifications')}>See all</a>;

  let content = (
    <Scrollbars
      className="notifications-area"
      style={{ maxHeight: 300 }}
      autoHide
      autoHeight
    >
      <ul className="notifications-list">
        {
          notifications.map((notif, key) =>
            <NotificationRow notification={notif} key={key} />,
          )
        }
      </ul>
    </Scrollbars>
  );

  if (notifCount === 0) {
    content = (
      <EmptyState
        icon={<i className="ion-android-notifications" />}
        text="Coming soon.."
        size="small"
      />
    );
    seeAll = null;
  }

  return (
    <div className="notifications-wrapper">
      {content}
      {seeAll}
    </div>
  );
}

NotificationsLatest.propTypes = {
  notifications: PropTypes.array.isRequired,
};

export default NotificationsLatest;
