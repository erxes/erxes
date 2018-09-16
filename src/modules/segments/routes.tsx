import * as React from 'react';
import { Route } from 'react-router-dom';
import { SegmentsForm, SegmentsList } from './containers';

const routes = () => [
  <Route
    key="/segments/:contentType"
    exact
    path="/segments/:contentType"
    component={({ match }) => {
      const contentType = match.params.contentType;

      return <SegmentsList contentType={contentType} />;
    }}
  />,

  <Route
    key="/segments/new/:contentType"
    exact
    path="/segments/new/:contentType"
    component={({ match, history }) => {
      const contentType = match.params.contentType;

      return <SegmentsForm history={history} contentType={contentType} />;
    }}
  />,

  <Route
    key="/segments/edit/:contentType/:id"
    exact
    path="/segments/edit/:contentType/:id"
    component={({ match, history }) => {
      const { id, contentType } = match.params;

      return (
        <SegmentsForm id={id} history={history} contentType={contentType} />
      );
    }}
  />
];

export default routes;
