import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const FileManager = asyncComponent(() =>
  import(/* webpackChunkName: "File Manager" */ './containers/FileManager')
);

const filemanager = ({ location, history }) => {
  return (
    <FileManager
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => (
  <>
    <Route
      key="/filemanager"
      path="/filemanager"
      exact={true}
      component={filemanager}
    />
  </>
);

export default routes;
