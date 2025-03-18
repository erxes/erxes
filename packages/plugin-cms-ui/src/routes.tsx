import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React, { useEffect } from 'react';
import { Route, Routes, useLocation, useParams } from 'react-router-dom';
import { getEnv } from '@erxes/ui/src/utils';
import { getVersion } from '@erxes/ui/src/utils/core';
import queryString from "query-string";

const WebList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Webs" */ './modules/web/containers/List'
    )
);

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
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  return <CategoryList queryParams={queryParams} />;
};

const TagsComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  return <Tags queryParams={queryParams} />;
};

const PostsComponent = () => {
  // const { cpId = '' } = useParams();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  return <PostList queryParams={queryParams} />;
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
        <p>
          Make sure REACT_APP_WEBBUILDER_URL is defined in environment variables
        </p>
      </div>
    );
  }

  return null;
};

const routes = () => (
  <Routes>
    <Route key='/cms' path='/cms' element={<WebList />} />
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

    <Route
      key='/cms/website/:cpId/posts'
      path='/cms/website/:cpId/posts'
      element={<PostsComponent />}
    />

    <Route
      key='/cms/website/:cpId/posts/new'
      path='/cms/website/:cpId/posts/new'
      element={<PostAddComponent />}
    />

    <Route
      key='/cms/website/:cpId/posts/edit/:id'
      path='/cms/website/:cpId/posts/edit/:id'
      element={<PostEditComponent />}
    />

    <Route
      key='/cms/website/:cpId/pages'
      path='/cms/website/:cpId/pages'
      element={<PagesComponent />}
    />

    <Route
      key='/cms/website/:cpId/categories'
      path='/cms/website/:cpId/categories'
      element={<CategoriesComponent />}
    />

    <Route
      key='/cms/website/:cpId/tags'
      path='/cms/website/:cpId/tags'
      element={<TagsComponent />}
    />
  </Routes>
);

export const menu = (clientPortalId: string) => [
  { title: 'Posts', link: '/cms/website/' + clientPortalId + '/posts' },
  { title: 'Categories', link: '/cms/website/' + clientPortalId + '/categories' },
  { title: 'Tags', link: '/cms/website/' + clientPortalId + '/tags' },
  { title: 'Pages', link: '/cms/website/' + clientPortalId + '/pages' },
];

export default routes;
