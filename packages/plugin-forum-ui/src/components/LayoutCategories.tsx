import React from 'react';
import { Switch, Route } from 'react-router-dom';
import CategoriesNav from '../containers/CategoriesNav';
import CategoryDetail from '../containers/CategoryDetail';
import CategoryNew from '../containers/CategoryNew';

export default function LayoutCategories() {
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'fit-content(50%) 1fr' }}
    >
      <CategoriesNav />
      <div>
        <Switch>
          <Route path={`/forums/categories/new`}>
            <CategoryNew />
          </Route>
          <Route path={`/forums/categories/:categoryId`}>
            <CategoryDetail />
          </Route>
        </Switch>
      </div>
    </div>
  );
}
