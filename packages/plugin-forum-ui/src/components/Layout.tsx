import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
// import PostsList from '../containers/PostsList';
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
import SubscriptionProductEdit from '../containers/SubscriptionProduct/Edit';
import CategoriesList from '../containers/Categories/CategoriesList';
import List from '../containers/PostsList/List';

function Layout() {
  return (
    <Switch>
      <Route exact={true} path={'/forums'}>
        <h1>Dashboard</h1>
      </Route>
      <Route path={`/forums/categories`}>
        <CategoriesList />
      </Route>

      <Route exact={true} path={`/forums/posts/new`}>
        <PostNew />
      </Route>

      <Route exact={true} path={`/forums/posts/:postId`}>
        <PostDetail />
      </Route>

      <Route exact={true} path={`/forums/posts/:postId/edit`}>
        <PostEdit />
      </Route>

      <Route path={`/forums/posts`}>
        <List />
      </Route>

      <Route exact={true} path={'/forums/permission-groups'}>
        <PermissionGroupList />
      </Route>

      <Route exact={true} path={'/forums/permission-groups/new'}>
        <PermissionGroupNew />
      </Route>

      <Route
        exact={true}
        path={'/forums/permission-groups/:permissionGroupId/edit'}
      >
        <PermissionGroupEdit />
      </Route>

      <Route exact={true} path={'/forums/permission-groups/:permissionGroupId'}>
        <PermissionGroupDetail />
      </Route>

      <Route exact={true} path={'/forums/subscription-products/'}>
        <SubscriptionProductHome />
      </Route>

      <Route exact={true} path={'/forums/subscription-products/new'}>
        <SubscriptionProductNew />
      </Route>

      <Route exact={true} path={'/forums/subscription-products/:id/edit'}>
        <SubscriptionProductEdit />
      </Route>

      <Route exact={true} path={`/forums/pages`}>
        <PagesList />
      </Route>

      <Route exact={true} path={`/forums/pages/new`}>
        <PageNew />
      </Route>

      {/* <Route exact={true} path={`/forums/pages/:id`}>
        <PageDetail />
      </Route> */}

      <Route exact={true} path={`/forums/pages/:id/edit`}>
        <PageEdit />
      </Route>
    </Switch>
  );
}

export default Layout;
