import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

const CmsIndex = lazy(() =>
  import('~/pages/cms/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);

const Posts = lazy(() =>
  import('~/modules/cms/components/pages/Posts').then((module) => ({
    default: module.Posts,
  })),
);

const AddPost = lazy(() =>
  import('~/modules/cms/components/posts/AddPost').then((module) => ({
    default: module.AddPost,
  })),
);

const Categories = lazy(() =>
  import('~/modules/cms/components/categories/Category').then((module) => ({
    default: module.Category,
  })),
);

const Tags = lazy(() =>
  import('~/modules/cms/components/shared/Tag').then((module) => ({
    default: module.Tag,
  })),
);

const Pages = lazy(() =>
  import('~/modules/cms/components/pages/Page').then((module) => ({
    default: module.Page,
  })),
);

const Menus = lazy(() =>
  import('~/modules/cms/components/menus/Menus').then((module) => ({
    default: module.Menus,
  })),
);

const CustomTypes = lazy(() =>
  import('~/modules/cms/components/shared/CustomTypes').then((module) => ({
    default: module.CustomTypes,
  })),
);

const CustomFields = lazy(() =>
  import('~/modules/cms/components/shared/CustomFields').then((module) => ({
    default: module.CustomFields,
  })),
);

const WebBuilderPage = lazy(() =>
  import('~/modules/web-builder/WebBuilderPage').then((module) => ({
    default: module.WebBuilderPage,
  })),
);

const CmsMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route index path="/" element={<Navigate to="cms" replace />} />
        <Route path="cms" element={<CmsIndex />} />
        <Route path="cms/:websiteId/posts" element={<Posts />} />
        <Route path="cms/:websiteId/posts/add" element={<AddPost />} />
        <Route path="cms/:websiteId/categories" element={<Categories />} />
        <Route path="cms/:websiteId/tags" element={<Tags />} />
        <Route path="cms/:websiteId/pages" element={<Pages />} />
        <Route path="cms/:websiteId/menus" element={<Menus />} />
        <Route path="cms/:websiteId/custom-types" element={<CustomTypes />} />
        <Route path="cms/:websiteId/custom-fields" element={<CustomFields />} />
        <Route path="web-builder/*" element={<WebBuilderPage />} />
      </Routes>
    </Suspense>
  );
};

export default CmsMain;
