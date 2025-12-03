import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const PutResponseIndexPage = lazy(() =>
  import('~/pages/PutResponsePage').then((module) => ({
    default: module.PutResponseIndexPage,
  })),
);

const putResponseMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<PutResponseIndexPage />} />
      </Routes>
    </Suspense>
  );
};

export default putResponseMain;
