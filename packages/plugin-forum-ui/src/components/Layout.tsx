import React from 'react';
import { Switch, Route, Link, useRouteMatch } from 'react-router-dom';
import Posts from '../containers/Posts';
import LayoutCategories from './LayoutCategories';

function Layout() {
  // The `path` lets us build <Route> paths that are
  // relative to the parent route, while the `url` lets
  // us build relative links.
  const { path, url } = useRouteMatch();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr' }}>
      <ul>
        <li>
          <Link to={`${url}/categories`}>Categories</Link>
        </li>
        <li>
          <Link to={`${url}/posts`}>Posts</Link>
        </li>
      </ul>

      <Switch>
        <Route exact path={path}>
          <h1>Dashboard</h1>
        </Route>
        <Route path={`${path}/categories`}>
          <LayoutCategories />
        </Route>
        <Route path={`${path}/posts`}>
          <Posts />
        </Route>
      </Switch>
    </div>
  );
}

export default Layout;
