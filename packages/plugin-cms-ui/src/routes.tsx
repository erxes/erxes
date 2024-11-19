import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';

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
const Component = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return <CategoryList location={location} navigate={navigate} />;
};

const RedirectComponent = () => {
  return <Redirect/>;
};

const PostComponent = () => {

  const { cpId = ''} = useParams();
  console.log('PostComponent', cpId);
  return <PostList clientPortalId={cpId}/>;
};

const CmsComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return <Cms location={location} navigate={navigate} />;
};

const routes = () => (
  <Routes>
    <Route
      key='/cms/categories'
      path='/cms/categories'
      element={<Component />}
    />

    <Route
      key='/cms/posts'
      path='/cms/posts'
      element={<RedirectComponent />}
    />

    <Route
      key='/cms/posts/:cpId'
      path='/cms/posts/:cpId'
      element={<PostComponent />}
    />

    <Route
      key='/cms/posts/:cpId/new'
      path='/cms/posts/:cpId/new'
      element={<PostForm />}
    />

    <Route
      key='/cms/posts/:cpId/edit/:id'
      path='/cms/posts/:cpId/edit/:id'
      element={<PostForm />}
    />
  </Routes>
);

export const menu = [
  { title: 'Posts', link: '/cms/posts' },
  { title: 'Category', link: '/cms/categories' },
  { title: 'Tags', link: '/cms/tags' },
];

export default routes;
