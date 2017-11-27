import React from 'react';
import { Route } from 'react-router-dom';
import { Manage } from '../fields/containers';

const routes = () => (
  <Route
    path="/fields/manage/:contentType/:contentTypeId?"
    component={({ match }) => {
      const { contentType, contentTypeId } = match.params;

      return <Manage contentType={contentType} contentTypeId={contentTypeId} />;
    }}
  />
);

export default routes;
