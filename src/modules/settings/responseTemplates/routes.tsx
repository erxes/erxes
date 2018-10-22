import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { List } from './containers';

const routes = () => {
  const responseTemplates = ({ location }) => {
    return <List queryParams={queryString.parse(location.search)} />;
  };

  return (
    <Route path="/settings/response-templates/" component={responseTemplates} />
  );
};

export default routes;
