import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { App as DumbApp } from '../components';
import { connection } from '../connection';
import queries from './graphql';

const propTypes = {
  data: PropTypes.shape({
    kbLoader: PropTypes.shape({
      loadType: PropTypes.string,
    }),
    loading: PropTypes.bool,
  }),
};

const App = (props) => {
  const extendedProps = {
    ...props,
    kbLoader: props.data.kbLoader,
  };

  if (props.data.loading) {
    return null;
  }

  return <DumbApp {...extendedProps} />;
};

App.propTypes = propTypes;

const AppWithData = graphql(
  gql(queries.kbLoaderQuery),
  {
    options: () => {
      return {
        fetchPolicy: 'network-only',
        variables: {
          topicId: connection.setting.topic_id,
        },
      }
    },
  },
)(App);

export default connect()(AppWithData);
