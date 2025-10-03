import { lazy, Suspense } from 'react';
import { Route } from 'react-router';
import { Routes } from 'react-router';

import { LogsPath } from '@/types/paths/LogPath';

const LogsIndexPage = lazy(() =>
  import('~/pages/logs/LogsIndexPage').then((module) => ({
    default: module.LogsIndexPage,
  })),
);

export const LogRoutes = () => {
  return (
    <Suspense>
      <Routes>
        <Route path={LogsPath.Index} element={<LogsIndexPage />} />
      </Routes>
    </Suspense>
  );
};
