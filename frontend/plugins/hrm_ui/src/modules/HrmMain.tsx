import { Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const HrmIndexPage = lazy(() =>
  import('~/pages/HrmIndexPage').then((module) => ({
    default: module.HrmIndexPage,
  })),
);

export const HrmMain = () => (
  <Suspense
    fallback={
      <div className="flex h-full items-center justify-center">
        <Spinner size="sm" />
      </div>
    }
  >
    <Routes>
      <Route path="/" element={<HrmIndexPage />} />
      <Route path="/main" element={<HrmIndexPage />} />
    </Routes>
  </Suspense>
);

export const Hrm = HrmMain;
