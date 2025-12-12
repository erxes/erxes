import { Route, Routes } from 'react-router';
import { Suspense, lazy } from 'react';

const Settings = lazy(() => import('./Settings'));

const PluginPos = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<Settings />} />
      </Routes>
    </Suspense>
  );
};

export default PluginPos;
