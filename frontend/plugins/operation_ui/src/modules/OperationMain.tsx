import { PluginSettingsRoutes } from 'ui-modules';
import { Suspense, lazy } from 'react';
import { AppLayout, Spinner } from 'erxes-ui';
import {
  OperationSidebar,
  OperationSidebarFooter,
  OperationSettingsLayout,
} from '~/Sidebar';
import { Navigate, Route, Routes } from 'react-router';

import { TasksPage } from '~/pages/TasksPage';
import { ProjectsPage } from '~/pages/ProjectsPage';
import { ProjectDetailPage } from '~/pages/ProjectDetailPage';
import { ProjectLayout } from '@/project/components/ProjectLayout';
import { TaskDetailPage } from '~/pages/TaskDetailPage';
import { CyclesPage } from '~/pages/CyclesPage';
import { CycleDetailPage } from '~/pages/CycleDetailPage';
import { TasksLayout } from '@/task/components/TasksLayout';
import { TriagePage } from '~/pages/TriagePage';

const OperationMain = () => {
  return (
    <AppLayout
      id="operation"
      title="Operation"
      sidebar={<OperationSidebar />}
      footer={<OperationSidebarFooter />}
    >
      <Suspense fallback={<div />}>
        <Routes>
          <Route path="/" element={<Navigate to="tasks" replace />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/created" element={<TasksPage />} />
          <Route path="tasks/:taskId" element={<TaskDetailPage />} />

          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<ProjectDetailPage />} />
            <Route path="tasks" element={<TasksLayout />} />
          </Route>

          <Route path="team/:teamId">
            <Route index element={<Navigate to="tasks" replace />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="triage" element={<TriagePage />} />
            <Route path="triage/:triageId" element={<TriagePage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="cycles" element={<CyclesPage />} />
            <Route path="cycles/:cycleId" element={<CycleDetailPage />} />
            <Route path="tasks/:taskId" element={<TaskDetailPage />} />
            <Route path="projects/:projectId" element={<ProjectLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<ProjectDetailPage />} />
              <Route path="tasks" element={<TasksLayout />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

const OperationSettingsRoutes = lazy(
  () => import('~/modules/OperationSettings'),
);
// JSX needs a capitalised name.
const OperationAppRoutes = OperationMain;

/** The plugin owns its settings too: `/operation/settings/*` has its own sidebar. */
const OperationEntry = () => (
  <Routes>
    <Route
      path="settings/*"
      element={
        <OperationSettingsLayout>
          <Suspense fallback={<Spinner />}>
            <PluginSettingsRoutes
              pluginName="operation"
              basePath="/operation/settings"
            >
              <OperationSettingsRoutes />
            </PluginSettingsRoutes>
          </Suspense>
        </OperationSettingsLayout>
      }
    />
    <Route path="*" element={<OperationAppRoutes />} />
  </Routes>
);

export default OperationEntry;
