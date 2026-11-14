import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useMatch } from 'react-router';
import { TeamMembersPath } from '../constants/teamMemberRoutes';
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

const TeamMemberDetailPage = lazy(() =>
  import('~/pages/settings/workspace/team-member/TeamMemberDetailPage').then(
    (module) => ({ default: module.TeamMemberDetailPage }),
  ),
);

const PermissionsPage = lazy(() =>
  import('~/pages/settings/workspace/team-member/PermissionPage').then(
    (module) => ({
      default: module.PermissionPage,
    }),
  ),
);

const TeamActivityPage = lazy(() =>
  import('~/pages/settings/workspace/team-member/TeamActivityPage').then(
    (module) => ({
      default: module.TeamActivityPage,
    }),
  ),
);

export const TeamMemberSettingsRoutes = () => {
  const isDetailPage = useMatch(
    `${TeamMembersPath.Index}${TeamMembersPath.TeamMembers}/:id`,
  );
  return (
    <PageContainer>
      {!isDetailPage && (
        <SettingsHeader breadcrumbs={<TeamMemberSettingsBreadcrumb />}>
          <TeamMemberTopbar />
        </SettingsHeader>
      )}
      <div className="flex flex-auto w-full overflow-hidden">
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
              path={`${TeamMembersPath.TeamMembers}/:id`}
              element={<TeamMemberDetailPage />}
            />
            <Route
              path={TeamMembersPath.TeamPermissions}
              element={<PermissionsPage />}
            />
            <Route
              path={TeamMembersPath.TeamActivity}
              element={<TeamActivityPage />}
            />
          </Routes>
        </Suspense>
      </div>
    </PageContainer>
  );
};
