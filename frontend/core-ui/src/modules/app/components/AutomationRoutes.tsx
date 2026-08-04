import { AutomationsPath } from '@/types/paths/AutomationPath';
import { Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
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
const WorkflowTemplateDetailPage = lazy(() =>
  import('~/pages/automations/WorkflowTemplateDetailPage').then((module) => ({
    default: module.WorkflowTemplateDetailPage,
  })),
);

export const AutomationRoutes = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path={AutomationsPath.Index} element={<AutomationIndexPage />} />
        <Route
          path={AutomationsPath.Create}
          element={<AutomationDetailPage />}
        />
        <Route
          path={AutomationsPath.Detail}
          element={<AutomationDetailPage />}
        />
        {/* Create must precede the :id route so it isn't captured as an id */}
        <Route
          path={AutomationsPath.TemplateCreate}
          element={<WorkflowTemplateDetailPage />}
        />
        <Route
          path={AutomationsPath.TemplateDetail}
          element={<WorkflowTemplateDetailPage />}
        />
      </Routes>
      <AutomationsPageEffect />
    </Suspense>
  );
};
