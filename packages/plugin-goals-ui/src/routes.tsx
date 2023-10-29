import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const GoalTypesList = asyncComponent(() =>
  import(/* webpackChunkName: "GoalTypesList" */ './containers/goalTypesList')
);

const goalTypesLists = ({ location, history }) => {
  return (
    <GoalTypesList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const GoalRoutes = () => {
  return (
    <React.Fragment>
      <Route
        path="/erxes-plugin-goalType/goalType"
        component={goalTypesLists}
      />
    </React.Fragment>
  );
};

export default GoalRoutes;
