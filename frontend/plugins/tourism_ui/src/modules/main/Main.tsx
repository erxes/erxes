import { lazy, Suspense } from 'react';
import { AppLayout } from 'erxes-ui';
import { TourismSidebar } from '~/Sidebar';
import { Navigate, Route, Routes } from 'react-router-dom';

const Tms = lazy(() =>
  import('~/pages/tms/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);
const TmsBranchDetail = lazy(() =>
  import('~/pages/tms/BranchDetailIndexPage').then((module) => ({
    default: module.BranchDetailIndexPage,
  })),
);

const TmsRecordDetail = lazy(() =>
  import('~/pages/tms/RecordDetailPage').then((module) => ({
    default: module.RecordDetailPage,
  })),
);

const TmsRecordNew = lazy(() =>
  import('~/pages/tms/RecordNewPage').then((module) => ({
    default: module.RecordNewPage,
  })),
);

const Pms = lazy(() =>
  import('~/pages/pms/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);

const App = () => {
  return (
    <AppLayout id="tourism" title="Tourism" sidebar={<TourismSidebar />}>
      <Suspense fallback={<div />}>
        <Routes>
          <Route path="/" element={<Navigate to="tms" replace />} />
          <Route path="tms" element={<Tms />} />
          <Route path="tms/branches/:branchId" element={<TmsBranchDetail />} />
          <Route
            path="tms/branches/:branchId/records/:recordType/new"
            element={<TmsRecordNew />}
          />
          <Route
            path="tms/branches/:branchId/records/:recordType/:recordId"
            element={<TmsRecordDetail />}
          />
          <Route path="pms" element={<Pms />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

export default App;
