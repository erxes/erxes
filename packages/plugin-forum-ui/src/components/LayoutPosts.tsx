import React from 'react';
import { Switch, Route } from 'react-router-dom';
import CategoriesFilter from '../containers/CategoriesFilter';

export default function LayoutCategories() {
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'fit-content(25%) 1fr' }}
    >
      <CategoriesFilter />
      <div>
        <Switch>
          <Route path={`/forums/posts/:postId`}>
            <h3>Post detail</h3>
          </Route>
          <Route path={`/forums/posts`}>
            <h3>posts</h3>
          </Route>
        </Switch>
      </div>
    </div>
  );
}
