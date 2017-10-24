import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../layout/containers';
import { SegmentsList, SegmentsForm } from './containers';

const routes = () => [
  <Route
    key="/segments/:contentType"
    exact
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
    exact
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
    exact
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
