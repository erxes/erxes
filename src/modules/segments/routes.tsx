import * as React from 'react';
import { Route } from 'react-router-dom';
import { SegmentsForm, SegmentsList } from './containers';

const routes = () => (
  <React.Fragment>
    <Route
      key="/segments/:contentType"
      exact={true}
      path="/segments/:contentType"
      component={({ match }) => {
        const contentType = match.params.contentType;

        return <SegmentsList contentType={contentType} />;
      }}
    />

    <Route
      key="/segments/new/:contentType"
      exact={true}
      path="/segments/new/:contentType"
      component={({ match, history }) => {
        const contentType = match.params.contentType;

        return <SegmentsForm history={history} contentType={contentType} />;
      }}
    />

    <Route
      key="/segments/edit/:contentType/:id"
      exact={true}
      path="/segments/edit/:contentType/:id"
      component={({ match, history }) => {
        const { id, contentType } = match.params;

        return (
          <SegmentsForm id={id} history={history} contentType={contentType} />
        );
      }}
    />
  </React.Fragment>
);

export default routes;
