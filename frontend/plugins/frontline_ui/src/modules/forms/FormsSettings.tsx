import { FrontlinePaths } from '@/types/FrontlinePaths';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { FormCreatePage } from '~/pages/FormCreatePage';

export const FormsPage = lazy(() =>
  import('~/pages/FormsPage').then((module) => ({
    default: module.FormsPage,
  })),
);

export const FormDetailPage = lazy(() =>
  import('~/pages/FormDetailPage').then((module) => ({
    default: module.FormDetailPage,
  })),
);

export const FormPreviewPage = lazy(() =>
  import('~/pages/FormPreviewPage').then((module) => ({
    default: module.FormPreviewPage,
  })),
);
export const FormsSettings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path={FrontlinePaths.ChannelForms} element={<FormsPage />} />
        <Route path={FrontlinePaths.FormDetail} element={<FormDetailPage />} />
        <Route
          path={FrontlinePaths.ChannelForms + '/create'}
          element={<FormCreatePage />}
        />
        <Route
          path={FrontlinePaths.FormPreview}
          element={<FormPreviewPage />}
        />
      </Routes>
    </Suspense>
  );
};
