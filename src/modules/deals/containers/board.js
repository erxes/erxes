import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { Board } from '../components';

import { mutations } from '../graphql';

class BoardContainer extends React.Component {
  render() {
    const { pipelinesAdd } = this.props;

    // add pipeline
    const addPipeline = ({ doc, callback }) => {
      pipelinesAdd({
        variables: doc
      })
        .then(() => {
          Alert.success('Success');
          callback();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const extendedProps = {
      ...this.props,
      addPipeline
    };

    return <Board {...extendedProps} />;
  }
}

BoardContainer.propTypes = {
  pipelinesAdd: PropTypes.func
};

export default compose(
  graphql(gql(mutations.pipelinesAdd), {
    name: 'pipelinesAdd'
  })
)(withRouter(BoardContainer));
