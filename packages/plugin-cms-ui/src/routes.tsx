import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import WebBuilder from './modules/pages/containers/Webbuilder';

const CategoryList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Category" */ './modules/categories/containers/List'
    )
);

const PostList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Post" */ './modules/posts/containers/List'
    )
);

const PostForm = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Form - Post" */ './modules/posts/containers/Form'
    )
);

const Cms = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Cms" */ './modules/clientportal/containers/Header'
    )
);

const Redirect = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Cms" */ './modules/clientportal/containers/Redirect'
    )
);

const Tags = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Tags" */ './modules/tags/containers/List'
    )
);

const Pages = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - WebBuilder" */ './modules/pages/containers/List'
    )
);

const CategoriesComponent = () => {
  return <CategoryList />;
};

const TagsComponent = () => {
  return <Tags />;
};

const RedirectComponent = () => {
  return <Redirect />;
};

const PostsComponent = () => {
  // const { cpId = '' } = useParams();

  return <PostList />;
};

const PostAddComponent = () => {
  return <PostForm />;
}

const PostEditComponent = () => {
  const { id } = useParams();
  return <PostForm id={id} />;
};

const CmsComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return <Cms location={location} navigate={navigate} />;
};

const PagesComponent = () => {
  const { cpId = '' } = useParams();

  return <Pages clientPortalId={cpId} />;
};

const PageDetailComponent = () => {
  const { pageId = '' } = useParams();

  return (
    <>
      {/* <h2>Page Detail</h2> */}
      {/* <p>cpId: {cpId}</p> */}
      {/* <p>pageId: {pageId}</p> */}
      <WebBuilder id={pageId} />
    </>
  );
};

const routes = () => (
  <Routes>
    <Route
      key='/cms/categories'
      path='/cms/categories'
      element={<CategoriesComponent />}
    />

    <Route key='/cms/posts' path='/cms/posts' element={<PostsComponent />} />

    <Route key='/cms/tags' path='/cms/tags' element={<TagsComponent />} />

    <Route
      key='/cms/pages'
      path='/cms/pages'
      element={<PagesComponent />}
    />

    <Route
      key='/cms/posts/:cpId'
      path='/cms/posts/:cpId'
      element={<PostsComponent />}
    />

    <Route
      key='/cms/posts/new'
      path='/cms/posts/new'
      element={<PostForm />}
    />

    <Route
      key='/cms/posts/edit/:id'
      path='/cms/posts/edit/:id'
      element={<PostEditComponent />}
    />

    <Route
      key='/cms/categories/:cpId'
      path='/cms/categories/:cpId'
      element={<CategoriesComponent />}
    />

    <Route
      key='/cms/tags/:cpId'
      path='/cms/tags/:cpId'
      element={<TagsComponent />}
    />

    <Route
      key='/cms/pages/:cpId'
      path='/cms/pages/:cpId'
      element={<PagesComponent />}
    />

    <Route
      key='/cms/pages/:cpId/:pageId'
      path='/cms/pages/:cpId/:pageId'
      element={<PageDetailComponent />}
    />
  </Routes>
);

export const menu = [
  { title: 'Posts', link: '/cms/posts' },
  { title: 'Category', link: '/cms/categories' },
  { title: 'Tags', link: '/cms/tags' },
  { title: 'Pages', link: '/cms/pages' },
];

export const webBuilderMenu = [
  { title: 'Pages', link: '/cms/pages' },
  { title: 'Blocks', link: '/cms/blocks' },
];

export default routes;
