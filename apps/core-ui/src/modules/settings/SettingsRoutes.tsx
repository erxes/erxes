import { Navigate, Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '~/modules/app/NotFoundPage';
import { AuditLogPage } from './audit-log/AuditLogPage';
import { EventDeliveryPage } from './event-delivery/EventDeliveryPage';
import { FileUploadSettingsPage } from './file-upload/FileUploadSettingsPage';
import { NotificationSettingsPage } from './notifications/NotificationSettingsPage';
import { PluginsSettingsPage } from './plugins/PluginsSettingsPage';
import { RolesSettingsPage } from './roles/RolesSettingsPage';
import { WebhooksSettingsPage } from './webhooks/WebhooksSettingsPage';
import { ProfileSettingsPage } from './profile/ProfileSettingsPage';
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
      <Route path="event-delivery" element={<EventDeliveryPage />} />
      <Route path="plugins" element={<PluginsSettingsPage />} />
      <Route path="roles" element={<RolesSettingsPage />} />
      <Route path="webhooks" element={<WebhooksSettingsPage />} />
      <Route path="notifications" element={<NotificationSettingsPage />} />
      <Route path="profile" element={<ProfileSettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);
