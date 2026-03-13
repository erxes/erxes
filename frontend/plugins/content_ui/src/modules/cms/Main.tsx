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

const Categories = lazy(() =>
  import('~/modules/cms/categories/Categories').then((module) => ({
    default: module.Categories,
  })),
);

const Tags = lazy(() =>
  import('~/modules/cms/tags/Tag').then((module) => ({
    default: module.Tag,
  })),
);

const Pages = lazy(() =>
  import('~/modules/cms/pages/Page').then((module) => ({
    default: module.Page,
  })),
);

const PagesDetail = lazy(() =>
  import('~/pages/cms/page-detail/PageDetailPage').then((module) => ({
    default: module.PagesDetailPage,
  })),
);

const CustomTypes = lazy(() =>
  import('~/modules/cms/custom-types/CustomTypes').then((module) => ({
    default: module.CustomTypes,
  })),
);

const CustomFields = lazy(() =>
  import('~/modules/cms/custom-fields/CustomFields').then((module) => ({
    default: module.CustomFields,
  })),
);

const WebBuilderPage = lazy(() =>
  import('~/modules/web-builder/WebBuilderPage').then((module) => ({
    default: module.WebBuilderPage,
  })),
);

const Menus = lazy(() =>
  import('~/modules/cms/menus/Menus').then((module) => ({
    default: module.Menus,
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

const CmsMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route index path="/" element={<Navigate to="cms" replace />} />
        <Route path="cms" element={<CmsIndex />} />
        <Route path="cms/:websiteId">
          <Route path="posts" element={<PostsWrapper />} />
          <Route path="posts/add" element={<PostsAddWrapper />} />
          <Route path="posts/detail/:postId" element={<PostsDetailWrapper />} />
          <Route path="categories" element={<Categories />} />
          <Route path="tags" element={<Tags />} />
          <Route path="pages" element={<Pages />} />
          <Route path="pages/detail" element={<PagesDetailWrapper />} />
          <Route path="pages/detail/:pageId" element={<PagesDetailWrapper />} />
          <Route path="menus" element={<Menus />} />
          <Route path="custom-types" element={<CustomTypes />} />
          <Route path="custom-fields" element={<CustomFields />} />
        </Route>
        <Route path="web-builder/*" element={<WebBuilderPage />} />
      </Routes>
    </Suspense>
  );
};

export default CmsMain;
