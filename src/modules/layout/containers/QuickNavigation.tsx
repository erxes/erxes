import client from 'apolloClient';
import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import * as React from 'react';
import { QuickNavigation } from '../components';

const QuickNavigationContainer = props => {
  const logout = () => {
    client
      .mutate({
        mutation: gql`
          mutation {
            logout
          }
        `
      })

      .then(() => {
        window.location.href = '/';
      });
  };

  return (
    <AppConsumer>
      {({ currentUser }) => (
        <QuickNavigation {...props} logout={logout} currentUser={currentUser} />
      )}
    </AppConsumer>
  );
};

export default QuickNavigationContainer;
