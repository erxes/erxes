import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import CategoriesNav from '../containers/CategoriesNav';

export default function Categories() {
  const { path } = useRouteMatch();

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'fit-content(50%) 1fr' }}
    >
      <CategoriesNav />
      <div>
        <Switch>
          <Route path={`${path}/:_id`}>
            <h1>cat</h1>
          </Route>
        </Switch>
      </div>
    </div>
  );
}
