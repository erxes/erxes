import { Route, Routes, useLocation } from 'react-router-dom';

import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const VideoCall = asyncComponent(
  () => import(/* webpackChunkName: "VideoCall" */ './components/VideoCall'),
);

const Recording = asyncComponent(
  () => import(/* webpackChunkName: "Recording" */ './components/Recording'),
);

const VideoCallComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <VideoCall queryParams={queryParams} />;
};

const RecordingComponent = () => {
  const location = useLocation();
  const link = location.search ? location.search.toString().substring(6) : '';

  return <Recording link={link} />;
};

const routes = () => (
  <Routes>
    <Route
      key="/videoCall"
      path="/videoCall"
      element={<VideoCallComponent />}
    />
    <Route
      key="/videoCall/recording"
      path="/videoCall/recording"
      element={<RecordingComponent />}
    />
  </Routes>
);

export default routes;
