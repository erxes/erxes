import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const DocumentsIndexPage = lazy(() =>
  import('~/pages/documents/DocumentsIndexPage').then((module) => ({
    default: module.default,
  })),
);

export const DocumentsRoutes = () => {
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route path="/" element={<DocumentsIndexPage />} />
      </Routes>
    </Suspense>
  );
};
