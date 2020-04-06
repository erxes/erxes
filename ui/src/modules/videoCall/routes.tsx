import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const VideoCall = asyncComponent(() =>
  import(/* webpackChunkName: "VideoCall" */ './components/VideoCall')
);

const videoCall = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <VideoCall queryParams={queryParams} />;
};

const routes = () => (
  <Route
    key="/videoCall"
    exact={true}
    path="/videoCall"
    component={videoCall}
  />
);

export default routes;
