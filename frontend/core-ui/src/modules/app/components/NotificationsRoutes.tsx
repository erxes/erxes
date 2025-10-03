import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { NotificationsPath } from '@/types/paths/NotificationsPath';
import { Spinner } from 'erxes-ui';
import { MyInboxPageChangeEffect } from '@/notification/my-inbox/components/MyInboxPageChangeEffect';

const MyInboxIndexPage = lazy(() =>
  import('~/pages/notifications/MyInboxIndexPage').then((module) => ({
    default: module.MyInboxIndexPage,
  })),
);

export const NotificationsRoutes = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path={NotificationsPath.Index} element={<MyInboxIndexPage />} />
        <Route path={NotificationsPath.Detail} element={<MyInboxIndexPage />} />
      </Routes>
      <MyInboxPageChangeEffect />
    </Suspense>
  );
};
