import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import CategoriesNav from '../containers/CategoriesNav';
import CategoryDetail from '../containers/CategoryDetail';
import CategoryNew from '../containers/CategoryNew';

export default function LayoutCategories() {
  const { path } = useRouteMatch();

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'fit-content(50%) 1fr' }}
    >
      <CategoriesNav />
      <div>
        <Switch>
          <Route path={`${path}/new`}>
            <CategoryNew />
          </Route>
          <Route path={`${path}/:categoryId`}>
            <CategoryDetail />
          </Route>
        </Switch>
      </div>
    </div>
  );
}
