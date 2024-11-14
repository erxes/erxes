import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
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

const Cms = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Cms" */ './modules/clientportal/containers/Header'
    )
);



const Component = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return <CategoryList location={location} navigate={navigate} />;
};

const PostComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return <PostList location={location} navigate={navigate} />;
}

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
        element={<PostComponent />}
      />
    
  </Routes>

);

export const menu = [
  { title: 'Posts', link: '/cms/posts' },
  { title: 'Category', link: '/cms/categories'},
  { title: 'Tags', link: '/cms/tags' },
];

export default routes;
