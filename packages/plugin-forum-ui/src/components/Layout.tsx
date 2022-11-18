import React from 'react';
import { Switch, Route, Link, useRouteMatch } from 'react-router-dom';
import LayoutCategories from './LayoutCategories';
import PostsList from '../containers/PostsList';
import PostDetail from '../containers/PostDetail';
import PostNew from '../containers/PostNew';
import PostEdit from '../containers/PostEdit';
import PermissionGroupList from '../containers/PermissionGroups/List';
import PermissionGroupNew from '../containers/PermissionGroups/New';
import PermissionGroupEdit from '../containers/PermissionGroups/Edit';
import PermissionGroupDetail from '../containers/PermissionGroups/Detail';
import SubscriptionProductHome from '../containers/SubscriptionProduct';
import SubscriptionProductNew from '../containers/SubscriptionProduct/New';
import PagesList from '../containers/Pages/List';
import PageNew from '../containers/Pages/New';
import PageDetail from '../containers/Pages/Detail';
import PageEdit from '../containers/Pages/Edit';

function Layout() {
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
        <li>
          <Link to={`/forums/pages`}>Pages</Link>
        </li>
        <li>
          <Link to={'/forums/permission-groups'}>Permission Groups</Link>
        </li>
        <li>
          <Link to={'/forums/subscription-products'}>
            Subscription Products
          </Link>
        </li>
      </ul>

      <div style={{ marginLeft: 50 }}>
        <Switch>
          <Route exact path={'/forums'}>
            <h1>Dashboard</h1>
          </Route>
          <Route path={`/forums/categories`}>
            <LayoutCategories />
          </Route>

          <Route exact path={`/forums/posts/new`}>
            <PostNew />
          </Route>

          <Route exact path={`/forums/posts/:postId`}>
            <PostDetail />
          </Route>

          <Route exact path={`/forums/posts/:postId/edit`}>
            <PostEdit />
          </Route>

          <Route path={`/forums/posts`}>
            <PostsList />
          </Route>

          <Route exact path={'/forums/permission-groups'}>
            <PermissionGroupList />
          </Route>

          <Route exact path={'/forums/permission-groups/new'}>
            <PermissionGroupNew />
          </Route>

          <Route
            exact
            path={'/forums/permission-groups/:permissionGroupId/edit'}
          >
            <PermissionGroupEdit />
          </Route>

          <Route exact path={'/forums/permission-groups/:permissionGroupId'}>
            <PermissionGroupDetail />
          </Route>

          <Route exact path={'/forums/subscription-products/'}>
            <SubscriptionProductHome />
          </Route>

          <Route exact path={'/forums/subscription-products/new'}>
            <SubscriptionProductNew />
          </Route>

          <Route exact path={`/forums/pages`}>
            <PagesList />
          </Route>

          <Route exact path={`/forums/pages/new`}>
            <PageNew />
          </Route>

          <Route exact path={`/forums/pages/:id`}>
            <PageDetail />
          </Route>

          <Route exact path={`/forums/pages/:id/edit`}>
            <PageEdit />
          </Route>
        </Switch>
      </div>
    </div>
  );
}

export default Layout;
