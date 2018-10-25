import gql from 'graphql-tag';
import { router as routerUtils, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Home } from '../components';
import { STORAGE_BOARD_KEY, STORAGE_PIPELINE_KEY } from '../constants';
import { queries } from '../graphql';
import {
  BoardDetailQueryResponse,
  BoardsGetLastQueryResponse,
  BoardsQueryResponse
} from '../types';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {
  boardsQuery: BoardsQueryResponse;
  boardGetLastQuery: BoardsGetLastQueryResponse;
  boardDetailQuery: BoardDetailQueryResponse;
} & Props;

/*
 * Main board component
 */
class Main extends React.Component<FinalProps> {
  render() {
    const {
      history,
      queryParams,
      boardsQuery,
      boardGetLastQuery,
      boardDetailQuery
    } = this.props;

    const lastBoard = boardGetLastQuery.dealBoardGetLast;
    const currentBoard = boardDetailQuery.dealBoardDetail;

    let currentPipeline;
    let boardId = queryParams.id || localStorage.getItem(STORAGE_BOARD_KEY);
    let pipelineId =
      queryParams.pipelineId || localStorage.getItem(STORAGE_PIPELINE_KEY);

    if (!boardId && lastBoard) {
      boardId = lastBoard._id;

      if (lastBoard.pipelines && lastBoard.pipelines.length > 0) {
        pipelineId = lastBoard.pipelines[0]._id;
      }

      routerUtils.setParams(history, { id: boardId, pipelineId });

      return null;
    }

    if (currentBoard) {
      currentPipeline = (currentBoard.pipelines || []).find(
        pipe => pipe._id === pipelineId
      );

      localStorage.setItem(STORAGE_BOARD_KEY, boardId);
      localStorage.setItem(STORAGE_PIPELINE_KEY, pipelineId);
    }

    const extendedProps = {
      ...this.props,
      currentBoard,
      currentPipeline,
      boards: boardsQuery.dealBoards || []
    };

    return <Home {...extendedProps} />;
  }
}

const MainContainer = withProps<Props>(
  compose(
    graphql<Props, BoardsQueryResponse>(gql(queries.boards), {
      name: 'boardsQuery'
    }),
    graphql<Props, BoardsGetLastQueryResponse>(gql(queries.boardGetLast), {
      name: 'boardGetLastQuery'
    }),
    graphql<Props, BoardDetailQueryResponse, { _id: string }>(
      gql(queries.boardDetail),
      {
        name: 'boardDetailQuery',
        skip: ({ queryParams }) =>
          !queryParams.id && !localStorage.getItem(STORAGE_BOARD_KEY),
        options: ({ queryParams }) => ({
          variables: {
            _id: queryParams.id || localStorage.getItem(STORAGE_BOARD_KEY)
          }
        })
      }
    )
  )(Main)
);

export default MainContainer;
