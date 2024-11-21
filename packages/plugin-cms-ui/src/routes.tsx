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


const Tags = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Tags" */ './modules/tags/containers/List'
  )
)

const CategoriesComponent = () => {
  const { cpId = ''} = useParams();

  return <CategoryList clientPortalId={cpId} />;
};

const TagsComponent = () => {
  const { cpId = ''} = useParams();

  return <Tags clientPortalId={cpId} />;
}

const RedirectComponent = () => {
  return <Redirect/>;
};

const PostsComponent = () => {

  const { cpId = ''} = useParams();

  return <PostList clientPortalId={cpId}/>;
};

const PostFormComponent = () => {
  const { cpId = ''} = useParams();

  return <PostForm clientPortalId={cpId}/>;
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
      element={<RedirectComponent />}
    />

    <Route
      key='/cms/posts'
      path='/cms/posts'
      element={<RedirectComponent />}
    />

    <Route
      key='/cms/tags'
      path='/cms/tags'
      element={<RedirectComponent />}
    />

    <Route
      key='/cms/posts/:cpId'
      path='/cms/posts/:cpId'
      element={<PostsComponent />}
    />

    <Route
      key='/cms/posts/:cpId/new'
      path='/cms/posts/:cpId/new'
      element={<PostFormComponent />}
    />

    <Route
      key='/cms/posts/:cpId/edit/:id'
      path='/cms/posts/:cpId/edit/:id'
      element={<PostForm />}
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
  </Routes>
);

export const menu = [
  { title: 'Posts', link: '/cms/posts' },
  { title: 'Category', link: '/cms/categories' },
  { title: 'Tags', link: '/cms/tags' },
];

export default routes;
