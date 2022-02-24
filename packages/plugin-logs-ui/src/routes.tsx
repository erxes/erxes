import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';

const LogList = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - Logs" */ './containers/LogList')
);

const logList = ({ location, history }) => {
  console.log('bbbbvsdkfhsdkjk');
  const queryParams = queryString.parse(location.search);
  // return <LogList queryParams={queryParams} history={history} />;
  return <h1>hahahha</h1>;
};

const routes = () => {
  console.log("hahahha")
  return <Route exact={true} path="/settings/logs/" component={logList} />
};

export default routes;
