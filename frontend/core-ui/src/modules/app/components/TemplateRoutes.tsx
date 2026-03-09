import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const TemplateIndexPage = lazy(() =>
  import('~/pages/templates/TemplateIndexPage').then((module) => ({
    default: module.TemplateIndexPage,
  })),
);

const TemplateCategoryIndexPage = lazy(() =>
  import('~/pages/templates/TemplateCategoryIndexPage').then((module) => ({
    default: module.TemplateCategoryIndexPage,
  })),
);

export const TemplateRoutes = () => {
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route index element={<TemplateIndexPage />} />
        <Route path="categories" element={<TemplateCategoryIndexPage />} />
      </Routes>
    </Suspense>
  );
};
