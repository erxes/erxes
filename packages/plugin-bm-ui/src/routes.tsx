import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route, useLocation, Routes, useParams, useNavigate } from 'react-router-dom';
import FormListContainer from './containers/FormList';

const List = asyncComponent(
  () => import(/* webpackChunkName: "List - Bms" */ './containers/ListBranch')
);

const AddEditContainer = asyncComponent(
  () => import(/* webpackChunkName: "PosContainer" */ './containers/BranchEdit')
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

const TourForms = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = queryString.parse(location?.search);
  return <FormListContainer queryParams={queryParams} location={location} navigate={navigate} />
};

const routes = () => {
  return (
    <Routes>
      <Route path='/tms/' element={<Bms />} />
      <Route
        key='/tms/edit/:bmsId'
        path='/tms/edit/:bmsId'
        element={<BmsEditAdd />}
      />
      <Route key='/tms/create' path='/tms/create' element={<BmsEditAdd />} />

      <Route path='/forms/bm-tours' element={<TourForms />} />
    </Routes>
  );
};

export default routes;
