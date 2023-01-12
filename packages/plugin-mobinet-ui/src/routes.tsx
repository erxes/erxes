import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Mobinet" */ './containers/List')
);

const CityList = asyncComponent(() =>
  import(/* webpackChunkName: "CityList" */ './modules/cities/containers/List')
);

const DistrictList = asyncComponent(() =>
  import(
    /* webpackChunkName: "CityList" */ './modules/districts/containers/List'
  )
);

const QuarterList = asyncComponent(() =>
  import(
    /* webpackChunkName: "CityList" */ './modules/quarters/containers/List'
  )
);

const BuildingList = asyncComponent(() =>
  import(
    /* webpackChunkName: "CityList" */ './modules/buildings/containers/List'
  )
);

const cityList = history => {
  const { location } = history;
  const queryParams = queryString.parse(location.search);

  return <CityList queryParams={queryParams} history={history} />;
};

const districtList = history => {
  const { location } = history;
  const queryParams = queryString.parse(location.search);

  return <DistrictList queryParams={queryParams} history={history} />;
};

const quarterList = history => {
  const { location } = history;
  const queryParams = queryString.parse(location.search);

  return <QuarterList queryParams={queryParams} history={history} />;
};

const buildingList = history => {
  const { location } = history;
  const queryParams = queryString.parse(location.search);

  const { type, viewType } = queryParams;

  return (
    <BuildingList
      queryParams={queryParams}
      history={history}
      viewType={viewType || 'list'}
    />
  );
};

const mobinets = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { type, viewType } = queryParams;

  return <List typeId={type} history={history} viewType={viewType} />;
};

const routes = () => {
  return (
    <>
      <Route path="/mobinet/building/list" component={buildingList} />
      <Route path="/mobinet/city/list" component={cityList} />
      <Route path="/mobinet/district/list" component={districtList} />
      <Route path="/mobinet/quarter/list" component={quarterList} />
    </>
  );
};

export default routes;
