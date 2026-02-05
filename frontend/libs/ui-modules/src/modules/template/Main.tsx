import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const Templates = lazy(() => import('./components/Templates'));

const templateMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<Templates />} />
      </Routes>
    </Suspense>
  );
};

export default templateMain;
