import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { TeamMembersPath } from '../constants/teamMemberRoutes';
import { TeamMemberSidebar } from './TeamMemberSidebar';
import { TeamMemberSettingsBreadcrumb } from './TeamMemberSettingsBreadcrumb';
import { TeamMemberTopbar } from './header/TeamMemberTopbar';
import { PageContainer, Spinner } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';

const TeamMemberPage = lazy(() =>
  import('~/pages/settings/workspace/team-member/TeamMemberPage').then(
    (module) => ({
      default: module.TeamMemberPage,
    }),
  ),
);

const PermissionsPage = lazy(() =>
  import('~/pages/settings/workspace/team-member/PermissionPage').then(
    (module) => ({
      default: module.PermissionPage,
    }),
  ),
);

export const TeamMemberSettingsRoutes = () => {
  return (
    <PageContainer>
      <SettingsHeader breadcrumbs={<TeamMemberSettingsBreadcrumb />}>
        <TeamMemberTopbar />
      </SettingsHeader>
      <div className="flex flex-auto w-full overflow-hidden">
        <TeamMemberSidebar />
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-full w-full">
              <Spinner />
            </div>
          }
        >
          <Routes>
            <Route
              index
              element={
                <Navigate
                  to={`${TeamMembersPath.Index}${TeamMembersPath.TeamMembers}`}
                  replace
                />
              }
            />
            <Route
              path={TeamMembersPath.TeamMembers}
              element={<TeamMemberPage />}
            />
            <Route
              path={TeamMembersPath.TeamPermissions}
              element={<PermissionsPage />}
            />
          </Routes>
        </Suspense>
      </div>
    </PageContainer>
  );
};
