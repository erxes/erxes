import { IconUserSquare } from '@tabler/icons-react';
import { Button, PageContainer } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Outlet, Route, Routes } from 'react-router';
import { SettingsHeader } from 'ui-modules';
import { TeamDetailPage } from '~/pages/TeamDetailPage';
import { TeamMembersPage } from '~/pages/TeamMembersPage';
import { TeamsSettingsPage } from '~/pages/TeamSettingsIndexPage';
import { TeamStatusPage } from '~/pages/TeamStatusPage';
import { OperationPaths } from '~/types/paths';

const TeamsSettings = lazy(() =>
  import('@/team/TeamSettings').then((module) => ({
    default: module.TeamSettings,
  })),
);

const OperationSettings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route
          path="/team"
          element={
            <PageContainer>
              <SettingsHeader
                breadcrumbs={
                  <Button variant="ghost" className="font-semibold">
                    <IconUserSquare className="w-4 h-4 text-accent-foreground" />
                    Team
                  </Button>
                }
              />
              <Outlet />
            </PageContainer>
          }
        >
          <Route index element={<TeamsSettingsPage />} />
          <Route
            path={OperationPaths.TeamDetail}
            element={<TeamDetailPage />}
          />
          <Route
            path={OperationPaths.TeamMembers}
            element={<TeamMembersPage />}
          />
          <Route
            path={OperationPaths.TeamStatus}
            element={<TeamStatusPage />}
          />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default OperationSettings;
