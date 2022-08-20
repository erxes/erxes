import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const CarList = asyncComponent(() =>
  import(/* webpackChunkName: "CarList" */ './containers/CarsList')
);

const CarDetails = asyncComponent(() =>
  import(/* webpackChunkName: "CarDetails" */ './containers/detail/CarDetails')
);

const ProductList = asyncComponent(() =>
  import(/* webpackChunkName: "ProductList" */ './containers/ProductList')
);

const ProductDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "ProductDetails" */ './containers/detail/ProductDetails'
  )
);

const PlaceList = asyncComponent(() =>
  import(/* webpackChunkName: "PlaceList" */ './containers/places/List')
);

const DirectionList = asyncComponent(() =>
  import(/* webpackChunkName: "DirectionList" */ './containers/directions/List')
);

const RouteList = asyncComponent(() =>
  import(/* webpackChunkName: "RouteList" */ './containers/routes/List')
);

const TripList = asyncComponent(() =>
  import(/* webpackChunkName: "TripList" */ './containers/trips/List')
);

const TripDetail = asyncComponent(() =>
  import(/* webpackChunkName: "TripDetail" */ './containers/trips/Detail')
);

const placeList = history => {
  const { location } = history;
  const queryParams = queryString.parse(location.search);

  return <PlaceList queryParams={queryParams} history={history} />;
};

const directionList = history => {
  const { location } = history;
  const queryParams = queryString.parse(location.search);

  return <DirectionList queryParams={queryParams} history={history} />;
};

const routeList = history => {
  const { location } = history;
  const queryParams = queryString.parse(location.search);

  return <RouteList queryParams={queryParams} history={history} />;
};

const tripList = history => {
  const { location } = history;
  const queryParams = queryString.parse(location.search);

  return <TripList queryParams={queryParams} history={history} />;
};

const tripDetail = ({ match }) => {
  const id = match.params.id;

  return <TripDetail id={id} />;
};

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

const productdetails = ({ match }) => {
  const id = match.params.id;

  return <ProductDetails id={id} />;
};

const product = ({ location, history }) => {
  return (
    <ProductList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/erxes-plugin-tumentech/car/list"
        exact={true}
        path="/erxes-plugin-tumentech/car/list"
        component={list}
      />

      <Route
        key="/erxes-plugin-tumentech/car/details/:id"
        exact={true}
        path="/erxes-plugin-tumentech/car/details/:id"
        component={details}
      />

      <Route key="/product" exact={true} path="/product" component={product} />

      <Route
        key="/product/details/:id"
        exact={true}
        path="/product/details/:id"
        component={productdetails}
      />

      <Route
        key={'/place'}
        exact={true}
        path="/erxes-plugin-tumentech/place/list"
        component={placeList}
      />

      <Route
        key={'/direction'}
        exact={true}
        path="/erxes-plugin-tumentech/direction/list"
        component={directionList}
      />

      <Route
        key={'/route'}
        exact={true}
        path="/erxes-plugin-tumentech/route/list"
        component={routeList}
      />

      <Route
        key={'/trip'}
        exact={true}
        path="/erxes-plugin-tumentech/trips/list"
        component={tripList}
      />

      <Route
        key="/erxes-plugin-tumentech/trips/detail/:id"
        exact={true}
        path="/erxes-plugin-tumentech/trips/detail/:id"
        component={tripDetail}
      />
    </React.Fragment>
  );
};

export default routes;
