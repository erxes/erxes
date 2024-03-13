import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import OnBoarding from './container/OnBoarding';

const routes = ({ currentUser }) => {
  const onboarding = ({ history, location }) => {
    const queryParams = queryString.parse(location.search);
    return (
      <OnBoarding
        currentUser={currentUser}
        queryParams={queryParams}
        history={history}
      />
    );
  };

  return (
    <Route
      key="/onboarding"
      exact={true}
      path="/onboarding"
      component={onboarding}
    />
  );
};

export default routes;
