import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const Knowledgebase = lazy(() =>
  import('~/pages/loyalty/Main').then((module) => ({
    default: module.SalesIndexPage,
  })),
);

const ContentFirstMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<Knowledgebase />} />
        <Route path="/voucher" element={<Knowledgebase />} />
        <Route path="/lottery" element={<Knowledgebase />} />
      </Routes>
    </Suspense>
  );
};

export default ContentFirstMain;
