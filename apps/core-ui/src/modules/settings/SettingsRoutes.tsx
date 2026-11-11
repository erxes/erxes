import { Navigate, Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '~/modules/app/NotFoundPage';
import { OrganizationPage } from './organization/OrganizationPage';
import { PropertiesPage } from './properties/PropertiesPage';
import { SettingsLayout } from './SettingsLayout';
import { TagsSettingsPage } from './tags/TagsSettingsPage';
import { TeamMemberSettingsRoutes } from './team-members/TeamMemberSettingsRoutes';

/** Everything under `/settings/*` (mount as `<Route path="settings/*" element={<SettingsRoutes />} />`). */
export const SettingsRoutes = () => (
  <Routes>
    <Route element={<SettingsLayout />}>
      <Route index element={<Navigate to="team-members" replace />} />
      <Route path="team-members/*" element={<TeamMemberSettingsRoutes />} />
      <Route path="tags" element={<TagsSettingsPage />} />
      <Route path="properties" element={<PropertiesPage />} />
      <Route path="organization" element={<OrganizationPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);
