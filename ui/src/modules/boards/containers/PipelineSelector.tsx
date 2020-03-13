import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { Alert, withProps } from '../../common/utils';
import PipelineSelector from '../components/stage/PipelineSelector';
import { STAGE_ACTIONS } from '../constants';
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
};

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
  pipelinesQuery: PipelinesQueryResponse;
  stagesMove: StageCopyMoveMutation;
  stagesCopy: StageCopyMoveMutation;
} & Props;

class PipelineSelectContainer extends React.Component<FinalProps> {
  copyOrMoveStage = (stageId: string, pipelineId: string) => {
    const { action, refetchStages, stagesCopy, stagesMove } = this.props;

    const variables = {
      _id: stageId,
      pipelineId,
      includeCards: true
    };

    let mutation;
    let message: string = '';

    if (action === STAGE_ACTIONS.COPY) {
      mutation = stagesCopy;
      message = 'copied';
    }

    if (action === STAGE_ACTIONS.MOVE) {
      mutation = stagesMove;
      message = 'moved';
    }

    mutation({ variables })
      .then(() => {
        Alert.success(`Stage successfully ${message}`);

        refetchStages({ pipelineId });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  }

  render() {
    const { boardsQuery, pipelinesQuery } = this.props;

    const boards = boardsQuery.boards || [];
    const pipelines = pipelinesQuery.pipelines || [];

    const extendedProps = {
      ...this.props,
      boards,
      pipelines,
      copyOrMoveStage: this.copyOrMoveStage,
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
