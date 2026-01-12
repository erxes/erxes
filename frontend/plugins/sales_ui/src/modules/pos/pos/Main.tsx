import { Route, Routes } from 'react-router';
import { Suspense, lazy } from 'react';

const Settings = lazy(() => import('./Settings'));

const PosEditPage = lazy(() =>
  import('~/pages/PosEditPage').then((module) => ({
    default: module.PosEditPage,
  })),
);

const PluginPos = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<Settings />} />
        <Route path="/:id" element={<PosEditPage />} />
      </Routes>
    </Suspense>
  );
};

export default PluginPos;
