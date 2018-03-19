import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Pipeline } from '../components';
import { queries } from '../graphql';
import { Spinner } from 'modules/common/components';
import { listObjectUnFreeze } from 'modules/common/utils';

class PipelineContainer extends React.Component {
  constructor(props) {
    super(props);

    const { collectStages, pipeline, stagesFromDb } = props;

    collectStages(pipeline._id, listObjectUnFreeze(stagesFromDb));
  }

  render() {
    return <Pipeline {...this.props} />;
  }
}

const propTypes = {
  collectStages: PropTypes.func,
  pipeline: PropTypes.object,
  stagesFromDb: PropTypes.array
};

PipelineContainer.propTypes = propTypes;

class StagesWithPipeline extends React.Component {
  render() {
    const { stagesQuery } = this.props;

    if (stagesQuery.loading) {
      return <Spinner />;
    }

    const stagesFromDb = stagesQuery.dealStages;

    const extendedProps = {
      ...this.props,
      stagesFromDb
    };

    return <PipelineContainer {...extendedProps} />;
  }
}

StagesWithPipeline.propTypes = {
  stagesQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ pipeline }) => ({
      variables: {
        pipelineId: pipeline._id
      }
    })
  })
)(StagesWithPipeline);
