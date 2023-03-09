import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const FileManager = asyncComponent(() =>
  import(/* webpackChunkName: "File Manager" */ './containers/FileManager')
);

const FileDetail = asyncComponent(() =>
  import(/* webpackChunkName: "File Detail" */ './containers/file/Detail')
);

const filemanager = ({ location, history }) => {
  return (
    <FileManager
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const detail = ({ match }) => {
  return <FileDetail />;
};

const routes = () => (
  <>
    <Route
      key="/filemanager"
      path="/filemanager"
      exact={true}
      component={filemanager}
    />

    <Route
      key="/filemanager/details/:id"
      exact={true}
      path="/filemanager/details/:id"
      component={detail}
    />
  </>
);

export default routes;
