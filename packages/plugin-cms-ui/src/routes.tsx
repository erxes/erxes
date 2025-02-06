import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import {
  Route,
  Routes,
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

const PostsComponent = () => {
  // const { cpId = '' } = useParams();

  return <PostList />;
};

const PostAddComponent = () => {
  return <PostForm />;
};

const PostEditComponent = () => {
  const { id } = useParams();
  return <PostForm id={id} />;
};


const PagesComponent = () => {
  const { cpId = '' } = useParams();

  return <Pages clientPortalId={cpId} />;
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

    <Route key='/cms/pages' path='/cms/pages' element={<PagesComponent />} />

    <Route key='/cms/posts/new' path='/cms/posts/new' element={<PostForm />} />

    <Route
      key='/cms/posts/edit/:id'
      path='/cms/posts/edit/:id'
      element={<PostEditComponent />}
    />
  </Routes>
);

export const menu = [
  { title: 'Posts', link: '/cms/posts' },
  { title: 'Category', link: '/cms/categories' },
  { title: 'Tags', link: '/cms/tags' },
  { title: 'Pages', link: '/cms/pages' },
];

export default routes;
