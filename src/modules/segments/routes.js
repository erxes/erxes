import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../layout/components';
import { Main } from '../layout/styles';
import { SegmentsList, SegmentsForm } from './containers';

const routes = () => (
  <Main>
    <Route
      path="/segments/:contentType"
      component={({ match }) => {
        const contentType = match.params.contentType;

        return (
          <MainLayout content={<SegmentsList contentType={contentType} />} />
        );
      }}
    />

    <Route
      path="/segments/new/:contentType"
      component={({ match }) => {
        const contentType = match.params.contentType;

        return (
          <MainLayout content={<SegmentsForm contentType={contentType} />} />
        );
      }}
    />

    <Route
      path="/segments/edit/:contentType/:id"
      component={({ match }) => {
        const { id, contentType } = match.params;

        return (
          <MainLayout
            content={<SegmentsForm id={id} contentType={contentType} />}
          />
        );
      }}
    />
  </Main>
);

export default routes;
