import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Pipeline } from '../components';
import { queries } from '../graphql';
import { Spinner } from 'modules/common/components';

class PipelineContainer extends React.Component {
  render() {
    const { stagesQuery } = this.props;

    if (stagesQuery.loading) {
      return <Spinner />;
    }

    const stages = stagesQuery.dealStages;

    const extendedProps = {
      ...this.props,
      stages
    };

    return <Pipeline {...extendedProps} />;
  }
}

const propTypes = {
  stagesQuery: PropTypes.object
};

PipelineContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ pipeline }) => ({
      variables: {
        pipelineId: pipeline._id
      }
    })
  })
)(PipelineContainer);
