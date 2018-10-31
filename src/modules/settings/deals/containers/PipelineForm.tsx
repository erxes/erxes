import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { PipelineForm } from '../components';
import { queries } from '../graphql';
import { IPipeline, IStage, StagesQueryResponse } from '../types';

type Props = {
  pipeline?: IPipeline;
  boardId: string;
  save: (
    params: { doc: { name: string; boardId?: string; stages: IStage[] } },
    callback: () => void,
    pipeline?: IPipeline
  ) => void;
  closeModal: () => void;
  show: boolean;
};

type FinalProps = {
  stagesQuery: StagesQueryResponse;
} & Props;

class EditPipelineFormContainer extends React.Component<FinalProps> {
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

const EditPipelineForm = withProps<Props>(
  compose(
    graphql<Props, StagesQueryResponse, { pipelineId: string }>(
      gql(queries.stages),
      {
        name: 'stagesQuery',
        options: ({ pipeline }: { pipeline?: IPipeline }) => ({
          variables: { pipelineId: pipeline ? pipeline._id : '' },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(EditPipelineFormContainer)
);

const PipelineFormContainer = (props: Props) => {
  const { pipeline } = props;

  if (pipeline) {
    return <EditPipelineForm {...props} />;
  }

  return <PipelineForm {...props} />;
};

export default PipelineFormContainer;
