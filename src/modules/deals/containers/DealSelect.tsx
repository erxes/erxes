import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Alert, withProps } from '../../common/utils';
import { DealSelect } from '../components';
import { queries } from '../graphql';
import {
  BoardsQueryResponse,
  IStage,
  PipelinesQueryResponse,
  StagesQueryResponse
} from '../types';

type Props = {
  stageId?: string;
  boardId: string;
  pipelineId: string;
  callback?: () => void;
  onChangeStage?: (stageId: string) => void;
  onChangePipeline: (pipelineId: string, stages: IStage[]) => void;
  onChangeBoard: (boardId: string) => void;
};

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
  pipelinesQuery: PipelinesQueryResponse;
  stagesQuery: StagesQueryResponse;
} & Props;

class DealSelectContainer extends React.Component<FinalProps> {
  onChangeBoard = (boardId: string) => {
    this.props.onChangeBoard(boardId);

    this.props.pipelinesQuery
      .refetch({ boardId })
      .then(({ data }) => {
        const pipelines = data.dealPipelines;

        if (pipelines.length > 0) {
          this.onChangePipeline(pipelines[0]._id);
        }
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  onChangePipeline = (pipelineId: string) => {
    const { stagesQuery } = this.props;

    stagesQuery
      .refetch({ pipelineId })
      .then(({ data }) => {
        const stages = data.dealStages;

        this.props.onChangePipeline(pipelineId, stages);

        if (stages.length > 0) {
          this.onChangeStage(stages[0]._id);
        }
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  onChangeStage = (stageId: string, callback?: any) => {
    if (this.props.onChangeStage) {
      this.props.onChangeStage(stageId);
    }

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

export default withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse>(gql(queries.boards), {
      name: 'boardsQuery'
    }),
    graphql<Props, PipelinesQueryResponse, { boardId: string }>(
      gql(queries.pipelines),
      {
        name: 'pipelinesQuery',
        options: ({ boardId = '' }) => ({
          variables: { boardId }
        })
      }
    ),
    graphql<Props, StagesQueryResponse, { pipelineId: string }>(
      gql(queries.stages),
      {
        name: 'stagesQuery',
        options: ({ pipelineId = '' }) => ({
          variables: { pipelineId }
        })
      }
    )
  )(DealSelectContainer)
);
