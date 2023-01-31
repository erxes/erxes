import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import PermissionGroupList from '../containers/PermissionGroups/List';
import PermissionGroupNew from '../containers/PermissionGroups/New';
import PermissionGroupEdit from '../containers/PermissionGroups/Edit';
import PermissionGroupDetail from '../containers/PermissionGroups/Detail';
import SubscriptionProductHome from '../containers/SubscriptionProduct';
import SubscriptionProductNew from '../containers/SubscriptionProduct/New';
import SubscriptionProductEdit from '../containers/SubscriptionProduct/Edit';
import CategoriesList from '../containers/Categories/CategoriesList';

function Layout() {
  return (
    <Switch>
      <Route exact={true} path={'/forums'}>
        <h1>Dashboard</h1>
      </Route>
      <Route path={`/forums/categories`}>
        <CategoriesList />
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
    </Switch>
  );
}

export default Layout;
