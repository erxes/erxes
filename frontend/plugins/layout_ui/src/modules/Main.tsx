import { Route, Routes } from 'react-router';
import { Suspense, lazy } from 'react';

import { Spinner } from 'erxes-ui';

const PagesIndexPage = lazy(() =>
  import('~/pages/PagesIndexPage').then((module) => ({
    default: module.PagesIndexPage,
  })),
);

const PageEditorPage = lazy(() =>
  import('~/pages/PageEditorPage').then((module) => ({
    default: module.PageEditorPage,
  })),
);

const DraftPreviewPage = lazy(() =>
  import('~/pages/PreviewPage').then((module) => ({
    default: module.DraftPreviewPage,
  })),
);

const PublishedPreviewPage = lazy(() =>
  import('~/pages/PreviewPage').then((module) => ({
    default: module.PublishedPreviewPage,
  })),
);

const LayoutMain = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<PagesIndexPage />} />
        <Route path="/edit/:id" element={<PageEditorPage />} />
        <Route path="/preview/:id" element={<DraftPreviewPage />} />
        <Route path="/published/:slug" element={<PublishedPreviewPage />} />
      </Routes>
    </Suspense>
  );
};

export default LayoutMain;
