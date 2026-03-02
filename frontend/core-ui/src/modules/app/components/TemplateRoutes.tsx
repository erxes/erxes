import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const TemplateIndexPage = lazy(() =>
  import('~/pages/templates/TemplateIndexPage').then((module) => ({
    default: module.TemplateIndexPage,
  })),
);

export const TemplateRoutes = () => {
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route path="/" element={<TemplateIndexPage />} />
      </Routes>
    </Suspense>
  );
};
