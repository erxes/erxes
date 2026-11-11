import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const TemplatesIndexPage = lazy(() =>
  import('~/pages/templates/TemplatesIndexPage').then((module) => ({
    default: module.TemplatesIndexPage,
  })),
);

const TemplateInstallationPage = lazy(() =>
  import('~/pages/templates/TemplateInstallationPage').then((module) => ({
    default: module.TemplateInstallationPage,
  })),
);

const TemplateInstallPage = lazy(() =>
  import('~/pages/templates/TemplateInstallPage').then((module) => ({
    default: module.TemplateInstallPage,
  })),
);

export const TemplateRoutes = () => (
  <Suspense fallback={<></>}>
    <Routes>
      <Route index element={<TemplatesIndexPage />} />
      <Route path="installations/:id" element={<TemplateInstallationPage />} />
      <Route path=":pluginName/:id" element={<TemplateInstallPage />} />
    </Routes>
  </Suspense>
);
