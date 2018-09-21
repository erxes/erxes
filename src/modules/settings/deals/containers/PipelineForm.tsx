import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { PipelineForm } from '../components';
import { queries } from '../graphql';
import { IPipeline, IStage } from '../types';

interface ICommonProps  {
  boardId: string;
  save: (params: { doc: { name: string; boardId: string, stages: IStage[] }}, callback: () => void, pipeline?: IPipeline) => void;
  closeModal: () => void;
  pipeline?: IPipeline;
  show: boolean;
};

interface IEditProps extends ICommonProps {
  stagesQuery: any,
  pipeline: IPipeline,
};

class EditPipelineFormContainer extends React.Component<IEditProps> {
  render() {
    const { stagesQuery, boardId, save, closeModal, pipeline } = this.props;

    if (stagesQuery.loading) {
      return <Spinner />;
    }

    const stages = stagesQuery.dealStages;

    const extendedProps = {
      ...this.props,
      stages,
      boardId,
      save,
      closeModal, 
      pipeline
    };

    return <PipelineForm {...extendedProps} />;
  }
}

const EditPipelineForm = compose(
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ pipeline } : { pipeline: IPipeline }) => ({
      variables: { pipelineId: pipeline._id || '' },
      fetchPolicy: 'network-only'
    })
  })
)(EditPipelineFormContainer);

const PipelineFormContainer = (props: ICommonProps) => {
  const { pipeline } = props;

  if (pipeline) {
    return <EditPipelineForm {...props} />;
  }

  return <PipelineForm {...props} />;
};

export default PipelineFormContainer;
