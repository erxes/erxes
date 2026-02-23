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
const PostsAdd = lazy(() =>
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
  import('~/modules/cms/shared/Tag').then((module) => ({
    default: module.Tag,
  })),
);

const Pages = lazy(() =>
  import('~/modules/cms/pages/Page').then((module) => ({
    default: module.Page,
  })),
);

const CustomTypes = lazy(() =>
  import('~/modules/cms/shared/CustomTypes').then((module) => ({
    default: module.CustomTypes,
  })),
);

const CustomFields = lazy(() =>
  import('~/modules/cms/shared/CustomFields').then((module) => ({
    default: module.CustomFields,
  })),
);

const PostsWrapper = () => {
  const { websiteId } = useParams();
  return <Posts clientPortalId={websiteId || ''} />;
};

const PostsAddWrapper = () => {
  const { websiteId } = useParams();
  return <PostsAdd clientPortalId={websiteId || ''} />;
};

const PostsEditWrapper = () => {
  const { websiteId, id } = useParams();
  return <PostsAdd clientPortalId={websiteId || ''} postId={id} />;
};
const PostsDetailWrapper = () => {
  const { websiteId, postId } = useParams();
  return <PostsDetail clientPortalId={websiteId || ''} postId={postId} />;
};
const CmsMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route index path="/" element={<Navigate to="cms" replace />} />
        <Route path="cms" element={<CmsIndex />} />
        <Route path="cms/:websiteId/posts/add" element={<PostsAddWrapper />} />
        <Route
          path="cms/:websiteId/posts/detail/:postId"
          element={<PostsDetailWrapper />}
        />
        <Route path="cms/:websiteId/posts/:id" element={<PostsEditWrapper />} />
        <Route path="cms/:websiteId/posts" element={<PostsWrapper />} />
        <Route path="cms/:websiteId/categories" element={<Categories />} />
        <Route path="cms/:websiteId/tags" element={<Tags />} />
        <Route path="cms/:websiteId/pages" element={<Pages />} />
        {/* <Route path="/:websiteId/menus" element={<Menus />} /> */}
        <Route path="cms/:websiteId/custom-types" element={<CustomTypes />} />
        <Route path="cms/:websiteId/custom-fields" element={<CustomFields />} />
      </Routes>
    </Suspense>
  );
};

export default CmsMain;
