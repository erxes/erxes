import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const Pos = lazy(() =>
  import('~/pages/PosIndexPage').then((module) => ({
    default: module.PosIndexPage,
  })),
);

const PluginPos = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<Pos />} />
      </Routes>
    </Suspense>
  );
};

export default PluginPos;
