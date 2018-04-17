import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { DealMove } from '../../components';
import { queries } from '../../graphql';

const propTypes = {
  stagesQuery: PropTypes.object
};

class DealMoveContainer extends React.Component {
  render() {
    const { stagesQuery } = this.props;

    if (stagesQuery.loading) {
      return null;
    }

    const stages = stagesQuery.dealStages;

    const updatedProps = {
      ...this.props,
      stages
    };

    return <DealMove {...updatedProps} />;
  }
}

DealMoveContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ deal: { pipeline } }) => ({
      variables: {
        pipelineId: pipeline._id
      }
    })
  })
)(DealMoveContainer);
