import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { CONTACT_SETTINGS } from '~/modules/contacts/settings/paths';
import { NotFoundPage } from '~/modules/app/NotFoundPage';
import { AuditLogPage } from './audit-log/AuditLogPage';
import { EventDeliveryPage } from './event-delivery/EventDeliveryPage';
import { FileUploadSettingsPage } from './file-upload/FileUploadSettingsPage';
import { GeneralSettingsPage } from './general/GeneralSettingsPage';
import { NotificationSettingsPage } from './notifications/NotificationSettingsPage';
import { PluginsSettingsPage } from './plugins/PluginsSettingsPage';
import { RolesSettingsPage } from './roles/RolesSettingsPage';
import { WebhooksSettingsPage } from './webhooks/WebhooksSettingsPage';
import { PaymentsSettingsPage } from './payments/PaymentsSettingsPage';
import { PlanPage } from './plan/PlanPage';
import { RecycleBinPage } from './recycle-bin/RecycleBinPage';
import { ProfileSettingsPage } from './profile/ProfileSettingsPage';
import { SecuritySettingsPage } from './profile/SecuritySettingsPage';
import { SettingsLayout } from './SettingsLayout';
import { TeamMemberSettingsRoutes } from './team-members/TeamMemberSettingsRoutes';

/**
 * An address that moved to Contacts › Settings: the same rest of the path and query there.
 * Mount it on a splat route: without its own `*`, useParams hands back the parent's (`tags`).
 */
const MovedTo = ({ base }: { base: string }) => {
  const rest = useParams()['*'];
  const { search } = useLocation();

  return <Navigate to={`${base}${rest ? `/${rest}` : ''}${search}`} replace />;
};

/** Everything under `/settings/*` (mount as `<Route path="settings/*" element={<SettingsRoutes />} />`). */
export const SettingsRoutes = () => (
  <Routes>
    <Route element={<SettingsLayout />}>
      <Route index element={<Navigate to="general" replace />} />
      <Route path="general" element={<GeneralSettingsPage />} />
      <Route path="team-members/*" element={<TeamMemberSettingsRoutes />} />
      <Route path="tags/*" element={<MovedTo base={CONTACT_SETTINGS.tags} />} />
      <Route path="properties/*" element={<MovedTo base={CONTACT_SETTINGS.properties} />} />
      <Route path="lead-stages/*" element={<MovedTo base={CONTACT_SETTINGS.leadStages} />} />
      <Route path="file-upload" element={<FileUploadSettingsPage />} />
      <Route path="audit-log" element={<AuditLogPage />} />
      <Route path="event-delivery" element={<EventDeliveryPage />} />
      <Route path="plugins" element={<PluginsSettingsPage />} />
      <Route path="roles" element={<RolesSettingsPage />} />
      <Route path="webhooks" element={<WebhooksSettingsPage />} />
      <Route path="payments" element={<PaymentsSettingsPage />} />
      <Route path="recycle-bin" element={<RecycleBinPage />} />
      <Route path="plan" element={<PlanPage />} />
      <Route path="import-export/*" element={<MovedTo base={CONTACT_SETTINGS.importExport} />} />
      <Route path="notifications" element={<NotificationSettingsPage />} />
      <Route path="profile" element={<ProfileSettingsPage />} />
      <Route path="security" element={<SecuritySettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);
