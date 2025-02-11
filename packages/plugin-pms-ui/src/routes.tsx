import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route, useLocation, Routes, useParams } from 'react-router-dom';

const List = asyncComponent(
  () => import(/* webpackChunkName: "List - Bms" */ './containers/ListBranch')
);

const AddEditContainer = asyncComponent(
  () => import(/* webpackChunkName: "PosContainer" */ './containers/BranchEdit')
);

const Pms = ({}) => {
  const location = useLocation();
  const queryParams = queryString.parse(location?.search);
  const { type } = queryParams;

  return <List typeId={type} queryParams={queryParams} />;
};
const PmsEditAdd = () => {
  const { pmsId } = useParams();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <AddEditContainer queryParams={queryParams} pmsId={pmsId} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path='/pms/' element={<Pms />} />
      <Route
        key='/pms/edit/:pmsId'
        path='/pms/edit/:pmsId'
        element={<PmsEditAdd />}
      />
      <Route key='/pms/create' path='/pms/create' element={<PmsEditAdd />} />
    </Routes>
  );
};

export default routes;
