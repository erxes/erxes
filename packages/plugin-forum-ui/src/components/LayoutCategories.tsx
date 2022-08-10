import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import CategoriesNav from '../containers/CategoriesNav';
import CategoryDetail from '../containers/CategoryDetail';

export default function LayoutCategories() {
  const { path } = useRouteMatch();

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'fit-content(50%) 1fr' }}
    >
      <CategoriesNav />
      <div>
        <Switch>
          <Route path={`${path}/:categoryId`}>
            <CategoryDetail />
          </Route>
        </Switch>
      </div>
    </div>
  );
}
