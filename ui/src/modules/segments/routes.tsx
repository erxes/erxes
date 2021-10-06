import asyncComponent from 'modules/common/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const SegmentsList = asyncComponent(() =>
  import(/* webpackChunkName: "SegmentsList" */ './containers/SegmentsList')
);

const SegmentsForm = asyncComponent(() =>
  import(
    /* webpackChunkName: "SegmentsForm" */ './containers/form/SegmentsForm'
  )
);

const segments = ({ match }) => {
  const contentType = match.params.contentType;

  return <SegmentsList contentType={contentType} />;
};

const segmentsForm = ({ match, history }) => {
  const contentType = match.params.contentType;

  return <SegmentsForm history={history} contentType={contentType} />;
};

const segmentsEditForm = ({ match, history }) => {
  const { id, contentType } = match.params;

  return <SegmentsForm id={id} history={history} contentType={contentType} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/segments/:contentType"
        exact={true}
        path="/segments/:contentType"
        component={segments}
      />

      <Route
        key="/segments/new/:contentType"
        exact={true}
        path="/segments/new/:contentType"
        component={segmentsForm}
      />

      <Route
        key="/segments/edit/:contentType/:id"
        exact={true}
        path="/segments/edit/:contentType/:id"
        component={segmentsEditForm}
      />
    </React.Fragment>
  );
};

export default routes;
