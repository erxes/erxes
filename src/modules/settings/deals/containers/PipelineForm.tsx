import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { PipelineForm } from '../components';
import { queries } from '../graphql';

class EditPipelineFormContainer extends React.Component<EditPipelineProps> {
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

type EditPipelineProps = {
  stagesQuery: any
};

const EditPipelineForm = compose(
  graphql<PipelineFormProps>(gql(queries.stages), {
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

type PipelineFormProps = {
  pipeline: any
};

export default PipelineFormContainer;
