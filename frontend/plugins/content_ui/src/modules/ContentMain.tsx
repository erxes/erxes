import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { useParams } from 'react-router-dom';

const CmsIndex = lazy(() =>
  import('~/pages/cms/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);

const Posts = lazy(() =>
  import('~/pages/cms/PostsPage').then((module) => ({
    default: module.PostsIndexPage,
  })),
);

const PostsAddPage = lazy(() =>
  import('~/pages/cms/PostsAddPage').then((module) => ({
    default: module.PostsAddPage,
  })),
);

const PostsDetail = lazy(() =>
  import('~/pages/cms/posts-detail/PostsDetailPage').then((module) => ({
    default: module.PostsDetailPage,
  })),
);

const CategoriesPage = lazy(() =>
  import('~/pages/cms/CategoriesPage').then((module) => ({
    default: module.CategoriesPage,
  })),
);

const TagsPage = lazy(() =>
  import('~/pages/cms/TagsPage').then((module) => ({
    default: module.TagsPage,
  })),
);

const PagesPage = lazy(() =>
  import('~/pages/cms/PagesPage').then((module) => ({
    default: module.PagesPage,
  })),
);

const PagesDetail = lazy(() =>
  import('~/pages/cms/page-detail/PageDetailPage').then((module) => ({
    default: module.PagesDetailPage,
  })),
);

const CustomTypesPage = lazy(() =>
  import('~/pages/cms/CustomTypesPage').then((module) => ({
    default: module.CustomTypesPage,
  })),
);

const CustomFieldsPage = lazy(() =>
  import('~/pages/cms/CustomFieldsPage').then((module) => ({
    default: module.CustomFieldsPage,
  })),
);

const WebBuilderPage = lazy(() =>
  import('~/modules/web-builder/WebBuilderPage').then((module) => ({
    default: module.WebBuilderPage,
  })),
);

const MenusPage = lazy(() =>
  import('~/pages/cms/MenusPage').then((module) => ({
    default: module.MenusPage,
  })),
);

const SettingsPage = lazy(() =>
  import('~/pages/cms/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  })),
);

const PostsWrapper = () => {
  const { websiteId } = useParams();
  return <Posts clientPortalId={websiteId || ''} />;
};

const PostsAddWrapper = () => {
  const { websiteId } = useParams();
  return <PostsAddPage clientPortalId={websiteId || ''} />;
};

const PostsDetailWrapper = () => {
  const { websiteId, postId } = useParams();
  return <PostsDetail clientPortalId={websiteId || ''} postId={postId} />;
};

const PagesDetailWrapper = () => {
  const { websiteId, pageId } = useParams();
  return <PagesDetail clientPortalId={websiteId || ''} pageId={pageId} />;
};

export const Content = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route index path="/" element={<Navigate to="cms" replace />} />
        <Route path="cms" element={<CmsIndex />} />
        <Route path="cms/:websiteId">
          <Route path="posts" element={<PostsWrapper />} />
          <Route path="posts/add" element={<PostsAddWrapper />} />
          <Route path="posts/detail/:postId" element={<PostsDetailWrapper />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="tags" element={<TagsPage />} />
          <Route path="pages" element={<PagesPage />} />
          <Route path="pages/detail" element={<PagesDetailWrapper />} />
          <Route path="pages/detail/:pageId" element={<PagesDetailWrapper />} />
          <Route path="menus" element={<MenusPage />} />
          <Route path="custom-types" element={<CustomTypesPage />} />
          <Route path="custom-fields" element={<CustomFieldsPage />} />
          <Route path="cmssettings" element={<SettingsPage />} />
        </Route>
        <Route path="web-builder/*" element={<WebBuilderPage />} />
      </Routes>
    </Suspense>
  );
};
