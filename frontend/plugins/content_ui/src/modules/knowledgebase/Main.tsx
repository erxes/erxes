import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const Knowledgebase = lazy(() =>
  import('~/pages/knowledgebase/IndexPage').then((module) => ({
    default: module.IndexPage,
  }))
);

const ContentFirstMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path='/' element={<Knowledgebase />} />
      </Routes>
    </Suspense>
  );
};

export default ContentFirstMain;
