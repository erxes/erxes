import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from '/imports/react-ui/common';
import Navigation from './Navigation';
import AlertContainer from '../../common/alert/containers/AlertContainer';

const propTypes = {
  content: PropTypes.element,
  loggedIn: PropTypes.bool.isRequired,
  loggingIn: PropTypes.bool.isRequired,
};

function MainLayout({ content, loggedIn, loggingIn }) {
  if (loggingIn) {
    return (
      <div className="full-loader">
        <Spinner />
      </div>
    );
  }

  if (!loggedIn) {
    return false;
  }

  return (
    <div className="layout">
      <Navigation />
      {content}
      <AlertContainer />
    </div>
  );
}

MainLayout.propTypes = propTypes;

export default MainLayout;
