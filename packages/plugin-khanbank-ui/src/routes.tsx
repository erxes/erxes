import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const ConfigsList = asyncComponent(() =>
  import(
    /* webpackChunkName: "ConfigList" */ './modules/configs/containers/List'
  )
);

const Menu = asyncComponent(() =>
  import(
    /* webpackChunkName: "Menu" */ './modules/corporateGateway/components/CorporateGateway'
  )
);

const configsList = history => {
  const { location } = history;
  const queryParams = queryString.parse(location.search);

  return <ConfigsList queryParams={queryParams} history={history} />;
};

const menu = history => {
  const { location } = history;
  const queryParams = queryString.parse(location.search);

  return <Menu queryParams={queryParams} history={history} />;
};

const routes = () => {
  return (
    <>
      <Route path="/settings/khanbank" component={configsList} />
      <Route path="/khanbank-corporate-gateway" component={menu} />
    </>
  );
};

export default routes;
