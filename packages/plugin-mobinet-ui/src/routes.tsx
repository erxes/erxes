import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route, useLocation, Routes, useParams } from 'react-router-dom';

const CityList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CityList" */ './modules/cities/containers/List'
    )
);

const DistrictList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CityList" */ './modules/districts/containers/List'
    )
);

const QuarterList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CityList" */ './modules/quarters/containers/List'
    )
);

const BuildingList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CityList" */ './modules/buildings/containers/List'
    )
);

const BuildingDetail = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "BuildingDetail" */ './modules/buildings/containers/Detail'
    )
);

const CityListElement = history => {
  const location = useLocation();

  const queryParams = queryString.parse(location.search);

  return <CityList queryParams={queryParams} history={history} />;
};

const DistrictListElement = history => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <DistrictList queryParams={queryParams} history={history} />;
};

const QuarterListElement = history => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <QuarterList queryParams={queryParams} history={history} />;
};

const BuildingListElement = history => {
  // const { location } = history;
  const location = useLocation();

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

const BuildingDetailElement = () => {
  const params = useParams();

  const id = params.id;

  return <BuildingDetail id={id} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        key='/mobinet/building/list'
        path='/mobinet/building/list'
        element={<BuildingListElement />}
      />
      <Route path='/mobinet/city/list' element={<CityListElement />} />
      <Route path='/mobinet/district/list' element={<DistrictListElement />} />
      <Route path='/mobinet/quarter/list' element={<QuarterListElement />} />
      <Route
        key='/mobinet/building/details/:id'
        path='/mobinet/building/details/:id'
        element={<BuildingDetailElement />}
      />
    </Routes>
  );
};

export default routes;
