import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const ProductList = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - FlowService" */ './containers/flow/FlowList'
  )
);

const Details = asyncComponent(() =>
  import(
    /* webpackChunkName: "FlowForm" */ '../flowUi/containers/forms/FlowForm'
  )
);

const productService = ({ location, history }) => {
  return (
    <ProductList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const details = ({ match, location }) => {
  const id = match.params.id;
  const queryParams = queryString.parse(location.search);

  return <Details id={id} queryParams={queryParams} />;
};

const routes = () => {
  return (
    <>
      <Route
        path="/processes/flows"
        exact={true}
        key="/processes/flows"
        component={productService}
      />
      <Route
        key="/processes/flows/details/:id"
        exact={true}
        path="/processes/flows/details/:id"
        component={details}
      />
    </>
  );
};

export default routes;
