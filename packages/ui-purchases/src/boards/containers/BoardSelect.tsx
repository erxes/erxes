import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, withProps } from '@erxes/ui/src/utils';
import BoardSelect from '../components/BoardSelect';
import { queries } from '../graphql';
import {
  BoardsQueryResponse,
  IStage,
  PipelinesQueryResponse,
  StagesQueryResponse
} from '../types';

type Props = {
  type: string;
  stageId?: string;
  boardId: string;
  pipelineId: string;
  callback?: () => void;
  onChangeStage?: (stageId: string) => void;
  onChangePipeline: (pipelineId: string, stages: IStage[]) => void;
  onChangeBoard: (boardId: string) => void;
  autoSelectStage?: boolean;
  translator?: (key: string, options?: any) => string;
};

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
  pipelinesQuery: PipelinesQueryResponse;
  stagesQuery: StagesQueryResponse;
} & Props;

class BoardSelectContainer extends React.Component<FinalProps> {
  onChangeBoard = (boardId: string) => {
    this.props.onChangeBoard(boardId);

    this.props.pipelinesQuery
      .refetch({ boardId })
      .then(({ data }) => {
        const pipelines = data.pipelines;

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
        const stages = data.stages;

        this.props.onChangePipeline(pipelineId, stages);

        if (
          stages.length > 0 &&
          typeof this.props.autoSelectStage === 'undefined'
        ) {
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

    const boards = boardsQuery.boards || [];
    const pipelines = pipelinesQuery.pipelines || [];
    const stages = stagesQuery.stages || [];

    const extendedProps = {
      ...this.props,
      boards,
      pipelines,
      stages,
      onChangeBoard: this.onChangeBoard,
      onChangePipeline: this.onChangePipeline,
      onChangeStage: this.onChangeStage
    };

    return <BoardSelect {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse>(gql(queries.boards), {
      name: 'boardsQuery',
      options: ({ type }) => ({
        variables: { type }
      })
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
  )(BoardSelectContainer)
);
