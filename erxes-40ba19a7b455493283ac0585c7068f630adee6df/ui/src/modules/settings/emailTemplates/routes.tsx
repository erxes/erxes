import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings - List EmailTemplate" */ './containers/List'
  )
);

const emailTemplates = ({ location }) => {
  return <List queryParams={queryString.parse(location.search)} />;
};

const routes = () => (
  <Route path="/settings/email-templates/" component={emailTemplates} />
);

export default routes;
