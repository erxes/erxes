import { Navigate, Route, Routes } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { lazyNamed } from '~/lib/lazyNamed';
import { NotFoundPage } from '~/modules/app/NotFoundPage';
import { usePlan } from '~/modules/saas/usePlan';
import { AuditLogPage } from './audit-log/AuditLogPage';
import { EventDeliveryPage } from './event-delivery/EventDeliveryPage';
import { FileUploadSettingsPage } from './file-upload/FileUploadSettingsPage';
import { GeneralSettingsPage } from './general/GeneralSettingsPage';
import { NotificationSettingsPage } from './notifications/NotificationSettingsPage';
import { PluginsSettingsPage } from './plugins/PluginsSettingsPage';
import { RolesSettingsPage } from './roles/RolesSettingsPage';
import { WebhooksSettingsPage } from './webhooks/WebhooksSettingsPage';
import { PlanPage } from './plan/PlanPage';
import { RecycleBinPage } from './recycle-bin/RecycleBinPage';
import { ProfileSettingsPage } from './profile/ProfileSettingsPage';
import { SecuritySettingsPage } from './profile/SecuritySettingsPage';
import { SettingsLayout } from './SettingsLayout';
import { TeamMemberSettingsRoutes } from './team-members/TeamMemberSettingsRoutes';

const DataModelRoutes = lazyNamed(
  () => import('~/modules/dataExtensions/settings/DataModelRoutes'),
  'DataModelRoutes',
);

const AssistantKeysPage = lazyNamed(
  () => import('./assistant/AssistantKeysPage'),
  'AssistantKeysPage',
);

const AssistantCodeModePage = lazyNamed(
  () => import('./assistant/AssistantCodeModePage'),
  'AssistantCodeModePage',
);

const AssistantAppearancePage = lazyNamed(
  () => import('./assistant/AssistantAppearancePage'),
  'AssistantAppearancePage',
);

// Fetched on first visit: few members open these, so they stay out of settings' chunk.
const StructurePage = lazyNamed(() => import('./structure/StructurePage'), 'StructurePage');

const ApiReferencePage = lazyNamed(
  () => import('./developer/ApiReferencePage'),
  'ApiReferencePage',
);

const ApiKeysPage = lazyNamed(() => import('./developer/ApiKeysPage'), 'ApiKeysPage');
const KeyEditorPage = lazyNamed(() => import('./developer/keys/KeyEditorPage'), 'KeyEditorPage');

const PaymentsSettingsPage = lazyNamed(
  () => import('./payments/PaymentsSettingsPage'),
  'PaymentsSettingsPage',
);

const IntegrationsSettingsPage = lazyNamed(
  () => import('./integrations/IntegrationsSettingsPage'),
  'IntegrationsSettingsPage',
);

const EmailSettingsPage = lazyNamed(() => import('./email/EmailSettingsPage'), 'EmailSettingsPage');

const IntegrationPage = lazyNamed(
  () => import('./integrations/IntegrationPage'),
  'IntegrationPage',
);

/** Settings › Plugins, unless the deployment installs and approves plugins itself. */
const PluginsRoute = () => {
  const plan = usePlan().data;

  if (plan?.pluginsManaged) return <Navigate to={paths.settings.general} replace />;

  return <PluginsSettingsPage />;
};

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
      <Route path="api-reference/:api?/:audience?" element={<ApiReferencePage />} />
      <Route path="api-keys" element={<ApiKeysPage />} />
      <Route path="api-keys/new" element={<KeyEditorPage />} />
      <Route path="api-keys/:id" element={<KeyEditorPage />} />
      <Route path="plugins" element={<PluginsRoute />} />
      <Route path="roles" element={<RolesSettingsPage />} />
      <Route path="structure" element={<StructurePage />} />
      <Route path="webhooks" element={<WebhooksSettingsPage />} />
      <Route path="payments" element={<PaymentsSettingsPage />} />
      <Route path="email" element={<EmailSettingsPage />} />
      <Route path="integrations" element={<IntegrationsSettingsPage />} />
      <Route path="integrations/:key" element={<IntegrationPage />} />
      <Route path="recycle-bin" element={<RecycleBinPage />} />
      <Route path="plan" element={<PlanPage />} />
      <Route path="notifications" element={<NotificationSettingsPage />} />
      <Route path="profile" element={<ProfileSettingsPage />} />
      <Route path="security" element={<SecuritySettingsPage />} />
      <Route path="assistant" element={<AssistantKeysPage />} />
      <Route path="assistant-code-mode" element={<AssistantCodeModePage />} />
      <Route path="assistant-appearance" element={<AssistantAppearancePage />} />
      <Route path="data-model/*" element={<DataModelRoutes />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);
