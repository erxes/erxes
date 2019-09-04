import React from 'react';
import Widget from '../components/Widget';
import { NotifConsumer } from '../context';

const WidgetContainer = () => (
  <NotifConsumer>
    {({ unreadCount, notifications, markAsRead, isLoading }) => {
      const updatedProps = {
        unreadCount,
        notifications,
        markAsRead,
        isLoading
      };
      return <Widget {...updatedProps} />;
    }}
  </NotifConsumer>
);

export default WidgetContainer;
