import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { TeamMembersPath } from '../constants/teamMemberRoutes';

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
    <Suspense fallback={<></>}>
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
  );
};
