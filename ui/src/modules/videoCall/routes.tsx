import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const VideoCall = asyncComponent(() =>
  import(/* webpackChunkName: "VideoCall" */ './components/VideoCall')
);

const Recording = asyncComponent(() =>
  import(/* webpackChunkName: "Recording" */ './components/Recording')
);

const videoCall = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <VideoCall queryParams={queryParams} />;
};

const recording = ({ location }) => {
  const link = location.search ? location.search.toString().substring(6) : '';

  return <Recording link={link} />;
};

const routes = () => (
  <>
    <Route
      key="/videoCall"
      exact={true}
      path="/videoCall"
      component={videoCall}
    />
    <Route
      key="/videoCall/recording"
      exact={true}
      path="/videoCall/recording"
      component={recording}
    />
  </>
);

export default routes;
