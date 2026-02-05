import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const Knowledgebase = lazy(() =>
  import('~/pages/knowledgebase/IndexPage').then((module) => ({
    default: module.default,
  }))
);

const KnowledgeBaseMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path='/' element={<Knowledgebase />} />
      </Routes>
    </Suspense>
  );
};

export default KnowledgeBaseMain;
