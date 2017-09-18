import React from 'react';
import { ApolloProvider } from 'react-apollo';
import PropTypes from 'prop-types';
import client from '/imports/react-ui/apollo-client';
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
    <ApolloProvider client={client}>
      <div className="layout">
        <Navigation />
        {content}
        <AlertContainer />
      </div>
    </ApolloProvider>
  );
}

MainLayout.propTypes = propTypes;

export default MainLayout;
