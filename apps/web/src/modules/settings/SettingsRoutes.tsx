import { Navigate, Route, Routes } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { NotFoundPage } from '~/modules/app/NotFoundPage';
import { lazyNamed } from '~/lib/lazyNamed';
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

const PluginPropertiesSettings = lazyNamed(
  () => import('./properties/PluginPropertiesSettings'),
  'PluginPropertiesSettings',
);

const AssistantKeysPage = lazyNamed(
  () => import('./assistant/AssistantKeysPage'),
  'AssistantKeysPage',
);

const AssistantApprovalsPage = lazyNamed(
  () => import('./assistant/AssistantApprovalsPage'),
  'AssistantApprovalsPage',
);

const AssistantCodeModePage = lazyNamed(
  () => import('./assistant/AssistantCodeModePage'),
  'AssistantCodeModePage',
);

const AssistantAppearancePage = lazyNamed(
  () => import('./assistant/AssistantAppearancePage'),
  'AssistantAppearancePage',
);

/** Everything under `/settings/*` (mount as `<Route path="settings/*" element={<SettingsRoutes />} />`). */
export const SettingsRoutes = () => (
  <Routes>
    <Route element={<SettingsLayout />}>
      <Route index element={<Navigate to={paths.settings.general} replace />} />
      <Route path="general" element={<GeneralSettingsPage />} />
      <Route path="team-members/*" element={<TeamMemberSettingsRoutes />} />
      <Route path="file-upload" element={<FileUploadSettingsPage />} />
      <Route path="audit-log" element={<AuditLogPage />} />
      <Route path="event-delivery" element={<EventDeliveryPage />} />
      <Route path="plugins" element={<PluginsSettingsPage />} />
      <Route path="roles" element={<RolesSettingsPage />} />
      <Route path="webhooks" element={<WebhooksSettingsPage />} />
      <Route path="payments" element={<PaymentsSettingsPage />} />
      <Route path="recycle-bin" element={<RecycleBinPage />} />
      <Route path="plan" element={<PlanPage />} />
      <Route path="notifications" element={<NotificationSettingsPage />} />
      <Route path="profile" element={<ProfileSettingsPage />} />
      <Route path="security" element={<SecuritySettingsPage />} />
      <Route path="assistant" element={<AssistantKeysPage />} />
      <Route path="assistant-approvals" element={<AssistantApprovalsPage />} />
      <Route path="assistant-code-mode" element={<AssistantCodeModePage />} />
      <Route path="assistant-appearance" element={<AssistantAppearancePage />} />
      <Route path="properties/*" element={<PluginPropertiesSettings />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);
