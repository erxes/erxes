import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Bulk, Spinner } from 'modules/common/components';
import { queries } from '../graphql';
import { PipelineForm } from '../components';

class EditPipelineFormContainer extends Bulk {
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

    return <PipelineForm {...extendedProps} />;
  }
}

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
