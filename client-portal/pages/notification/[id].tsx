import { useRouter } from 'next/router';
import React from 'react';

import AppProvider, { AppConsumer } from '../../modules/appContext';
import NotificationDetial from '../../modules/main/containers/notifications/Detail';

const Notification = () => {
  const router = useRouter();
  const id = router.query.id as string;

  return (
    <AppProvider>
      <AppConsumer>
        {({ currentUser }: any) => {
          return <NotificationDetial _id={id} currentUser={currentUser} />;
        }}
      </AppConsumer>
    </AppProvider>
  );
};

export default Notification;
