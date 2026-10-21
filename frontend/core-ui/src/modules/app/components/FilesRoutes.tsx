import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const FilesIndexPage = lazy(() =>
  import('~/pages/files/FilesIndexPage').then((module) => ({
    default: module.FilesIndexPage,
  })),
);

const FilesTrashPage = lazy(() =>
  import('~/pages/files/FilesTrashPage').then((module) => ({
    default: module.FilesTrashPage,
  })),
);

export const FilesRoutes = () => {
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route path="/" element={<FilesIndexPage space="personal" />} />
        <Route path="/org" element={<FilesIndexPage space="org" />} />
        <Route path="/shared" element={<FilesIndexPage space="shared" />} />
        <Route path="/trash" element={<FilesTrashPage />} />
      </Routes>
    </Suspense>
  );
};
