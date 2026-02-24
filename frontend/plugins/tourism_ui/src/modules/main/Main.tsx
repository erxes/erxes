import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const Tms = lazy(() =>
  import('~/pages/tms/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);
const TmsPreview = lazy(() =>
  import('~/pages/tms/PreviewPage').then((module) => ({
    default: module.PreviewPage,
  })),
);
const Pms = lazy(() =>
  import('~/pages/pms/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);

const App = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<Navigate to="tms" replace />} />
        <Route path="tms" element={<Tms />} />
        <Route path="tms/PreviewPage" element={<TmsPreview />} />
        <Route path="pms" element={<Pms />} />
      </Routes>
    </Suspense>
  );
};

export default App;
