import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries } from '../graphql';
import { Pipelines } from '../components';

const PipelinesContainer = props => {
  const { pipelinesQuery } = props;

  const integrations = pipelinesQuery.integrations || [];

  const updatedProps = {
    ...props,
    integrations,
    refetch: pipelinesQuery.refetch,
    loading: pipelinesQuery.loading
  };

  return <Pipelines {...updatedProps} />;
};

PipelinesContainer.propTypes = {
  pipelinesQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.pipelines), {
    name: 'pipelinesQuery',
    options: ({ currentBoardId }) => ({
      variables: { boardId: currentBoardId || '' }
    })
  })
)(PipelinesContainer);
