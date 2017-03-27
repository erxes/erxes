import { Tracker } from 'meteor/tracker';
import React from 'react';
import { Loader, Spinner, Loading } from '/imports/react-ui/common';

export function getTrackerLoader(reactiveMapper) {
  return (props, onData, env) => {
    let trackerCleanup = null;
    const handler = Tracker.nonreactive(() =>
      Tracker.autorun(() => {
        trackerCleanup = reactiveMapper(props, onData, env);
      }),
    );

    return () => {
      if (typeof trackerCleanup === 'function') trackerCleanup();
      return handler.stop();
    };
  };
}

export function composerOptions({ spinner, loading }) {
  let Component = Loader;

  if (spinner) {
    Component = Spinner;
  }

  if (loading) {
    Component = Loading;
  }

  return {
    loadingHandler: () => <Component />,
  };
}

