import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { DealSelect } from '../components';
import { queries } from '../graphql';
import { IStage } from '../types';

type Props = {
  boardsQuery: any;
  pipelinesQuery: any;
  stagesQuery: any;
  onChangeStage: (stageId: string, callback?: () => void) => Promise<any>;
  onChangePipeline: (pipelineId: string, stages: IStage[]) => Promise<any>;
  onChangeBoard: (boardId: string) => Promise<void>;
};

class DealSelectContainer extends React.Component<Props> {
  onChangeBoard = (boardId: string) => {
    this.props.onChangeBoard(boardId);

    this.props.pipelinesQuery.refetch({ boardId }).then(({ data }) => {
      const pipelines = data.dealPipelines;

      if (pipelines.length > 0) {
        this.onChangePipeline(pipelines[0]._id);
      }
    });
  };

  onChangePipeline = (pipelineId: string) => {
    const { stagesQuery } = this.props;

    stagesQuery.refetch({ pipelineId }).then(({ data }) => {
      const stages = data.dealStages;

      this.props.onChangePipeline(pipelineId, stages);

      if (stages.length > 0) {
        this.onChangeStage(stages[0]._id);
      }
    });
  };

  onChangeStage = (stageId: string, callback?: any) => {
    this.props.onChangeStage(stageId);

    if (callback) {
      callback();
    }
  };

  render() {
    const { boardsQuery, pipelinesQuery, stagesQuery } = this.props;

    const boards = boardsQuery.dealBoards || [];
    const pipelines = pipelinesQuery.dealPipelines || [];
    const stages = stagesQuery.dealStages || [];

    const extendedProps = {
      ...this.props,
      boards,
      pipelines,
      stages,
      onChangeBoard: this.onChangeBoard,
      onChangePipeline: this.onChangePipeline,
      onChangeStage: this.onChangeStage
    };

    return <DealSelect {...extendedProps} />;
  }
}

export default compose(
  graphql(gql(queries.boards), {
    name: 'boardsQuery'
  }),
  graphql(gql(queries.pipelines), {
    name: 'pipelinesQuery',
    options: ({ boardId = '' }: { boardId: string }) => ({
      variables: { boardId }
    })
  }),
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ pipelineId = '' }: { pipelineId: string }) => ({
      variables: { pipelineId }
    })
  })
)(DealSelectContainer);
