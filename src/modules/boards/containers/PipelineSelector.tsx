import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { Alert, withProps } from '../../common/utils';
import PipelineSelector from '../components/stage/PipelineSelector';
import { mutations, queries } from '../graphql';
import {
  BoardsQueryResponse,
  IStageRefetchParams,
  PipelinesQueryResponse,
  StageCopyMoveMutation
} from '../types';

type Props = {
  type: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  action: string;
  refetchStages: (params: IStageRefetchParams) => void;
  closeModal: () => void;
  currentPipelineId: string;
};

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
  pipelinesQuery: PipelinesQueryResponse;
  stagesMove: StageCopyMoveMutation;
  stagesCopy: StageCopyMoveMutation;
} & Props;

class PipelineSelectContainer extends React.Component<FinalProps> {
  copyStage = (stageId: string, pipelineId: string) => {
    const { closeModal, stagesCopy } = this.props;

    const variables = {
      _id: stageId,
      pipelineId,
      includeCards: true
    };

    stagesCopy({ variables })
      .then(() => {
        Alert.success('Stage successfully copied');

        closeModal();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  moveStage = (stageId: string, pipelineId: string) => {
    const {
      closeModal,
      stagesMove,
      refetchStages,
      currentPipelineId
    } = this.props;

    const variables = {
      _id: stageId,
      pipelineId,
      includeCards: true
    };

    stagesMove({ variables })
      .then(() => {
        Alert.success('Stage successfully moved');

        closeModal();

        refetchStages({ pipelineId: currentPipelineId });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    const { boardsQuery, pipelinesQuery } = this.props;

    const boards = boardsQuery.boards || [];
    const pipelines = pipelinesQuery.pipelines || [];

    const extendedProps = {
      ...this.props,
      boards,
      pipelines,
      moveStage: this.moveStage,
      copyStage: this.copyStage
    };

    return <PipelineSelector {...extendedProps} />;
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
    graphql<Props>(gql(mutations.stagesMove), {
      name: 'stagesMove'
    }),
    graphql<Props>(gql(mutations.stagesCopy), {
      name: 'stagesCopy'
    })
  )(PipelineSelectContainer)
);
