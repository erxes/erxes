import { lazy, Suspense } from 'react';
import { Route } from 'react-router';
import { Routes } from 'react-router';
import { Spinner } from 'erxes-ui';

import { AutomationsPath } from '@/types/paths/AutomationPath';
import { AutomationsPageEffect } from '~/pages/automations/AutomationPageEffect';

const AutomationIndexPage = lazy(() =>
  import('~/pages/automations/AutomationIndexPage').then((module) => ({
    default: module.AutomationsIndexPage,
  })),
);
const AutomationDetailPage = lazy(() =>
  import('~/pages/automations/AutomationDetailPage').then((module) => ({
    default: module.AutomationDetailPage,
  })),
);

export const AutomationRoutes = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path={AutomationsPath.Index} element={<AutomationIndexPage />} />
        <Route
          path={AutomationsPath.Detail}
          element={<AutomationDetailPage />}
        />
      </Routes>
      <AutomationsPageEffect />
    </Suspense>
  );
};
