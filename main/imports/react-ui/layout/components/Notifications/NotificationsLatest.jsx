import React, { PropTypes } from 'react';
import ScrollArea from 'react-scrollbar';
import { NotificationRow } from '../../containers';
import { EmptyState } from '/imports/react-ui/common';


function NotificationsLatest({ notifications }) {
  const notifCount = notifications.length;
  let seeAll = <a href={FlowRouter.path('/notifications')}>See all</a>;
  let content = (
    <ScrollArea className="notifications-area" horizontal={false}>
      <ul className="notifications-list">
        {
          notifications.map((notif, key) =>
            <NotificationRow notification={notif} key={key} />
          )
        }
      </ul>
    </ScrollArea>
  );

  if (notifCount === 0) {
    content = (
      <EmptyState
        icon={<i className="ion-android-notifications" />}
        text="No notifications"
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
