import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route, useLocation, Routes, useParams } from 'react-router-dom';

const List = asyncComponent(
  () => import(/* webpackChunkName: "List - Bms" */ './containers/ListBranch'),
);

const AddEditContainer = asyncComponent(
  () =>
    import(/* webpackChunkName: "PosContainer" */ './containers/BranchEdit'),
);

const Bms = ({}) => {
  const location = useLocation();
  const queryParams = queryString.parse(location?.search);
  const { type } = queryParams;

  return <List typeId={type} queryParams={queryParams} />;
};
const BmsEditAdd = () => {
  const { bmsId } = useParams();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <AddEditContainer queryParams={queryParams} bmsId={bmsId} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path='/bms/' element={<Bms />} />
      <Route
        key='/bms/edit/:bmsId'
        path='/bms/edit/:bmsId'
        element={<BmsEditAdd />}
      />
      <Route key='/bms/create' path='/bms/create' element={<BmsEditAdd />} />
    </Routes>
  );
};

export default routes;
