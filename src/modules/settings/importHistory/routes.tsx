import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { Histories } from './containers';

const routes = () => {
  const importHistories = ({ location }) => {
    const queryParams = queryString.parse(location.search);

    return <Histories queryParams={queryParams} />;
  };

  return (
    <Route path="/settings/importHistories/" component={importHistories} />
  );
};

export default routes;
