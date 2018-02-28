import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries } from '../graphql';
import { PipelineForm } from '../components';
import { Spinner } from 'modules/common/components';

const EditPipelineFormContainer = props => {
  const { stagesQuery } = props;

  if (stagesQuery.loading) {
    return <Spinner />;
  }

  const stages = stagesQuery.dealStages;

  const extendedProps = {
    ...props,
    stages
  };

  return <PipelineForm {...extendedProps} />;
};

EditPipelineFormContainer.propTypes = {
  stagesQuery: PropTypes.object
};

const EditPipelineForm = compose(
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ pipeline }) => ({
      variables: { pipelineId: pipeline._id || '' },
      fetchPolicy: 'network-only'
    })
  })
)(EditPipelineFormContainer);

const PipelineFormContainer = props => {
  const { pipeline } = props;

  if (pipeline) {
    return <EditPipelineForm {...props} />;
  }

  return <PipelineForm {...props} />;
};

PipelineFormContainer.propTypes = {
  pipeline: PropTypes.object
};

export default PipelineFormContainer;
