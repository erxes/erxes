import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';

import { router as routerUtils } from 'modules/common/utils';
import { Home } from '../components';
import { STORAGE_BOARD_KEY, STORAGE_PIPELINE_KEY } from '../constants';
import { queries } from '../graphql';

type Props = {
  history: any;
  queryParams: any;
  boardsQuery: any;
  boardGetLastQuery: any;
  boardDetailQuery: any;
};

/*
 * Main board component
 */
class Main extends React.Component<Props> {
  render() {
    const {
      history,
      queryParams,
      boardsQuery,
      boardGetLastQuery = {},
      boardDetailQuery = {}
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
      currentPipeline = currentBoard.pipelines.find(
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

const MainContainer = compose(
  graphql(gql(queries.boards), {
    name: 'boardsQuery'
  }),
  graphql(gql(queries.boardGetLast), {
    name: 'boardGetLastQuery'
  }),
  graphql(gql(queries.boardDetail), {
    name: 'boardDetailQuery',
    skip: ({ queryParams }) =>
      !queryParams.id && !localStorage.getItem(STORAGE_BOARD_KEY),
    options: ({ queryParams }: { queryParams: { id: string } }) => ({
      variables: {
        _id: queryParams.id || localStorage.getItem(STORAGE_BOARD_KEY)
      }
    })
  })
)(Main);

export default MainContainer;
