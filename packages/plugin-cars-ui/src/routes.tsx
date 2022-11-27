import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

import CarList from './containers/CarsList';
import CarDetails from './containers/detail/CarDetails';
import CarSection from './components/common/CarSection';

const details = ({ match }) => {
  const id = match.params.id;

  return <CarDetails id={id} />;
};

const list = ({ location, history }) => {
  return (
    <CarList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <>
      <Route
        key="/erxes-plugin-car/details/:id"
        exact={true}
        path="/erxes-plugin-car/details/:id"
        component={details}
      />
      <Route path="/cars" exact={true} key="/cars" component={list} />
    </>
  );
};

export default routes;
