import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { LogsPath } from '@/types/paths/LogPath';

const LogsIndexPage = lazy(() =>
  import('~/pages/settings/logs/LogsIndexPage').then((module) => ({
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
