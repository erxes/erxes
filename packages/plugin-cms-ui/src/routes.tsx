import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React, { useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { getEnv } from '@erxes/ui/src/utils';
import { getVersion } from '@erxes/ui/src/utils/core';

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

const WebBuilderRedirect = () => {
  const { VERSION } = getVersion();
  const { REACT_APP_WEBBUILDER_URL } = getEnv();

  useEffect(() => {
    if (VERSION === 'saas') {
      const currentHost = window.location.hostname;
      const subdomain = currentHost.split('.')[0];

      if (subdomain) {
        window.location.href = `https://${subdomain}.webbuilder.erxes.io`;
      }
    } else {
      if (REACT_APP_WEBBUILDER_URL) {
        window.location.href = REACT_APP_WEBBUILDER_URL;
      }
    }
  }, [VERSION, REACT_APP_WEBBUILDER_URL]);

  if (VERSION !== 'saas' && !REACT_APP_WEBBUILDER_URL) {
    return (
      <div style={{ textAlign: 'center', margin: '100px 0' }}>
        <h3>Web Builder URL not found</h3>
        <p>Make sure REACT_APP_WEBBUILDER_URL is defined in environment variables</p>
      </div>
    );
  }

  return null;
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

    <Route
      key='/cms/web-builder'
      path='/cms/web-builder'
      element={<WebBuilderRedirect />}
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
