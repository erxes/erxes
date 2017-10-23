import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../layout/components';
import { SegmentsList, SegmentsForm } from './containers';

const routes = () => [
  <Route
    key="/segments/:contentType"
    path="/segments/:contentType"
    component={({ match }) => {
      const contentType = match.params.contentType;

      return (
        <MainLayout content={<SegmentsList contentType={contentType} />} />
      );
    }}
  />,

  <Route
    key="/segments/new/:contentType"
    path="/segments/new/:contentType"
    component={({ match }) => {
      const contentType = match.params.contentType;

      return (
        <MainLayout content={<SegmentsForm contentType={contentType} />} />
      );
    }}
  />,

  <Route
    key="/segments/edit/:contentType/:id"
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
];

export default routes;
