import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const TeamsSettings = lazy(() =>
  import('@/team/TeamSettings').then((module) => ({
    default: module.TeamSettings,
  })),
);

const OperationSettings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/team/*" element={<TeamsSettings />} />
      </Routes>
    </Suspense>
  );
};

export default OperationSettings;
