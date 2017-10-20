import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../../layout/components';
import { List, ManageFields } from './containers';

const routes = () => (
  <div>
    <Route
      path='/settings/forms/'
      component={() => {
        return <MainLayout content={ <List queryParams={{}} /> } />
      }}
    />

    <Route
      path='/settings/manage-fields/:formId'
      component={(params) => {
        return <MainLayout content={<ManageFields formId={params.formId} /> } />
      }}
    />
  </div>
);

export default routes;
