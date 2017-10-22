import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../layout/components';
import { Main } from '../layout/styles';
import { Manage } from '../fields/containers';

const routes = () => (
  <Main>
    <Route
      path="/fields/manage/:contentType/:contentTypeId?"
      component={({ match }) => {
        const { contentType, contentTypeId } = match.params;

        return (
          <MainLayout
            content={
              <Manage contentType={contentType} contentTypeId={contentTypeId} />
            }
          />
        );
      }}
    />
  </Main>
);

export default routes;
