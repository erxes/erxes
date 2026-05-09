import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { Spinner } from 'erxes-ui';

const IndexPage = lazy(() =>
  import('~/pages/layouts/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);

const DashboardPage = lazy(() =>
  import('~/pages/layouts/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
);

const StaticPage = lazy(() =>
  import('~/pages/layouts/StaticPage').then((module) => ({
    default: module.StaticPage,
  })),
);

const LayoutMain = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="dashboards/:id" element={<DashboardPage />} />
        <Route path="pages/:slug" element={<StaticPage />} />
      </Routes>
    </Suspense>
  );
};

export default LayoutMain;
