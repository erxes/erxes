import { Navigate, Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '~/modules/app/NotFoundPage';
import { AuditLogPage } from './audit-log/AuditLogPage';
import { FileUploadSettingsPage } from './file-upload/FileUploadSettingsPage';
import { NotificationSettingsPage } from './notifications/NotificationSettingsPage';
import { PropertiesSettingsRoutes } from './properties/PropertiesSettingsRoutes';
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
      <Route path="properties/*" element={<PropertiesSettingsRoutes />} />
      <Route path="file-upload" element={<FileUploadSettingsPage />} />
      <Route path="audit-log" element={<AuditLogPage />} />
      <Route path="notifications" element={<NotificationSettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);
