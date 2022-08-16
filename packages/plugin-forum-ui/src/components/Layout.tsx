import React from 'react';
import { Switch, Route, Link, useRouteMatch } from 'react-router-dom';
import Posts from '../containers/Posts';
import LayoutCategories from './LayoutCategories';
import LayoutPosts from './LayoutPosts';

function Layout() {
  // The `path` lets us build <Route> paths that are
  // relative to the parent route, while the `url` lets
  // us build relative links.
  const { path, url } = useRouteMatch();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'fit-content(20%) 1fr',
        overflow: 'scroll'
      }}
    >
      <ul style={{ listStyle: 'none' }}>
        <li>
          <Link to={`/forums/categories`}>Categories</Link>
        </li>
        <li>
          <Link to={`/forums/posts`}>Posts</Link>
        </li>
      </ul>

      <Switch>
        <Route exact path={'/forums'}>
          <h1>Dashboard</h1>
        </Route>
        <Route path={`/forums/categories`}>
          <LayoutCategories />
        </Route>
        <Route path={`/forums/posts`}>
          <LayoutPosts />
        </Route>
      </Switch>
    </div>
  );
}

export default Layout;
