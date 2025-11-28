import { FrontlinePaths } from '@/types/FrontlinePaths';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const InboxSettings = lazy(() =>
  import('@/inbox/InboxSettings').then((module) => ({
    default: module.InboxSettings,
  })),
);

const FrontlineSettings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path={FrontlinePaths.InboxAll} element={<InboxSettings />} />
      </Routes>
    </Suspense>
  );
};

export default FrontlineSettings;
