import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { Spinner } from 'erxes-ui';

const KnowledgeBaseIndex = lazy(() =>
  import('~/pages/knowledgebase/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);

const PluginContent = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-full">
          <Spinner size="sm" />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<KnowledgeBaseIndex />} />
        <Route path="/knowledgebase" element={<KnowledgeBaseIndex />} />
      </Routes>
    </Suspense>
  );
};

export default PluginContent;
