import { EmailTemplateRoutesPath } from '@/types/paths/EmailTemplatePath';
import { Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const EmailTemplatesSettingsPage = lazy(() =>
  import('~/pages/settings/workspace/email-templates/EmailTemplatesSettingsPage').then(
    (module) => ({ default: module.EmailTemplatesSettingsPage }),
  ),
);

const EmailTemplateDetailSettingsPage = lazy(() =>
  import(
    '~/pages/settings/workspace/email-templates/EmailTemplateDetailSettingsPage'
  ).then((module) => ({ default: module.EmailTemplateDetailSettingsPage })),
);

export const EmailTemplatesSettingsRoutes = () => (
  <Suspense fallback={<Spinner />}>
    <Routes>
      <Route
        path={EmailTemplateRoutesPath.Index}
        element={<EmailTemplatesSettingsPage />}
      />
      <Route
        path={EmailTemplateRoutesPath.Create}
        element={<EmailTemplateDetailSettingsPage />}
      />
      <Route
        path={EmailTemplateRoutesPath.Detail}
        element={<EmailTemplateDetailSettingsPage />}
      />
    </Routes>
  </Suspense>
);
