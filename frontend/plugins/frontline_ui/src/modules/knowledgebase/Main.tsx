import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

const TopicsPage = lazy(() =>
  import('~/pages/knowledgebase/TopicsPage').then((module) => ({
    default: module.TopicsPage,
  })),
);

const ArticlesPage = lazy(() =>
  import('~/pages/knowledgebase/ArticlesPage').then((module) => ({
    default: module.ArticlesPage,
  })),
);

const CategoriesPage = lazy(() =>
  import('~/pages/knowledgebase/CategoriesPage').then((module) => ({
    default: module.CategoriesPage,
  })),
);

const TopicSettingsPage = lazy(() =>
  import('~/pages/knowledgebase/TopicSettingsPage').then((module) => ({
    default: module.TopicSettingsPage,
  })),
);

const KnowledgeBaseMain = () => (
  <Suspense fallback={<div />}>
    <Routes>
      <Route path="/" element={<TopicsPage />} />
      <Route path="/:topicId" element={<Navigate to="articles" replace />} />
      <Route path="/:topicId/articles" element={<ArticlesPage />} />
      <Route path="/:topicId/categories" element={<CategoriesPage />} />
      <Route
        path="/:topicId/kbsettings"
        element={<TopicSettingsPage />}
      />
    </Routes>
  </Suspense>
);

export default KnowledgeBaseMain;
