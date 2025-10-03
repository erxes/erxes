import { Suspense } from 'react';
import { Routes, Route } from 'react-router';
import { SettingsHeader } from 'ui-modules';
import { Button, PageContainer } from 'erxes-ui';
import { IconUserSquare } from '@tabler/icons-react';
import { Outlet } from 'react-router-dom';

import { TeamsSettingsPage } from '~/pages/TeamSettingsIndexPage';
import { TeamDetailPage } from '~/pages/TeamDetailPage';
import { OperationPaths } from '~/types/paths';
import { TeamMembersPage } from '~/pages/TeamMembersPage';
import { TeamStatusPage } from '~/pages/TeamStatusPage';

const TeamSettings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route
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
          <Route path="/" element={<TeamsSettingsPage />} />
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

export default TeamSettings;
