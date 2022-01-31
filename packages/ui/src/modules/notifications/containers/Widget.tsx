import React from 'react';
import Widget from '../components/Widget';
import { NotifConsumer } from '../context';

const WidgetContainer = () => (
  <NotifConsumer>
    {({
      unreadCount,
      notifications,
      isLoading,
      showNotifications,
      markAsRead,
      currentUser
    }) => {
      const updatedProps = {
        unreadCount,
        notifications,
        isLoading,
        showNotifications,
        markAsRead,
        currentUser
      };
      return <Widget {...updatedProps} />;
    }}
  </NotifConsumer>
);

export default WidgetContainer;
