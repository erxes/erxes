import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries } from '../graphql';
import DumbMessengerApps from 'modules/settings/integrations/components/MessengerApps';

const MessengerApps = props => {
  const { appsQuery } = props;

  const apps = appsQuery.messengerApps || [];

  return <DumbMessengerApps apps={apps} />;
};

MessengerApps.propTypes = {
  appsQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.messengerApps), {
    name: 'appsQuery',
    options: ({ kind }) => ({
      variables: { kind }
    })
  })
)(MessengerApps);
