import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const SegmentsList = asyncComponent(() =>
  import(/* webpackChunkName: "SegmentsList" */ './containers/SegmentsList')
);

const SegmentsForm = asyncComponent(() =>
  import(
    /* webpackChunkName: "SegmentsForm" */ '@erxes/ui-segments/src/containers/form/SegmentsForm'
  )
);

const segments = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  const { contentType } = queryParams;

  return (
    <SegmentsList
      queryParams={queryParams}
      contentType={contentType}
      history={history}
    />
  );
};

const segmentsForm = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  const { contentType } = queryParams;

  return <SegmentsForm history={history} contentType={contentType} />;
};

const segmentsEditForm = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  const { contentType, id } = queryParams;

  return <SegmentsForm id={id} history={history} contentType={contentType} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/segments/"
        exact={true}
        path="/segments/"
        component={segments}
      />

      <Route
        key="/segments/new/"
        exact={true}
        path="/segments/new/"
        component={segmentsForm}
      />

      <Route
        key="/segments/edit/"
        exact={true}
        path="/segments/edit/"
        component={segmentsEditForm}
      />
    </React.Fragment>
  );
};

export default routes;
