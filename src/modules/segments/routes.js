import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../layout/components';
import { SegmentsList, SegmentsForm } from './containers';

const routes = () => (
  <div>
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
  </div>
);

export default routes;
