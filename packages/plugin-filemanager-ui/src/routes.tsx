import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const FileManager = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings - File manager" */ './containers/FileManager'
  )
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
    <Route path="/settings/filemanager/" exact={true} component={filemanager} />
  </>
);

export default routes;
