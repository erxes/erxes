import { Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '~/modules/app/NotFoundPage';
import { TeamMemberDetailPage } from './details/TeamMemberDetailPage';
import { TeamMembersPage } from './TeamMembersPage';

/** `/settings/team-members/*`: the list, and a member's own page at `/:id`. */
export const TeamMemberSettingsRoutes = () => (
  <Routes>
    <Route index element={<TeamMembersPage />} />
    <Route path=":id" element={<TeamMemberDetailPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
