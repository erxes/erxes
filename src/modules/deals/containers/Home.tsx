import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';

import { router as routerUtils } from 'modules/common/utils';
import { Home } from '../components';
import { STORAGE_BOARD_KEY, STORAGE_PIPELINE_KEY } from '../constants';
import { queries } from '../graphql';

type Props = {
  history: any,
  queryParams: any,
  boardsQuery: any,
  boardGetLastQuery: any,
  boardDetailQuery: any
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

    const currentBoard = boardDetailQuery.dealBoardDetail;
    const storageBoardId = localStorage.getItem(STORAGE_BOARD_KEY);

    if (!queryParams.id) {
      // set default board from localStorage
      let boardId = storageBoardId;

      const lastBoard = boardGetLastQuery.dealBoardGetLast;

      // if no default board in localStorage, set last board as default
      if (!boardId && lastBoard) {
        boardId = lastBoard._id;
      }

      if (boardId) {
        routerUtils.setParams(history, { id: boardId });
        return null;
      }
    } else {
      // if not change default board
      if (queryParams.id !== storageBoardId) {
        localStorage.setItem(STORAGE_BOARD_KEY, queryParams.id);

        // set default
        localStorage.setItem(
          STORAGE_PIPELINE_KEY,
          JSON.stringify({ 0: true, 1: true })
        );
      }
    }

    const extendedProps = {
      ...this.props,
      currentBoard,
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
    name: 'boardGetLastQuery',
    skip: () => localStorage.getItem(STORAGE_BOARD_KEY) ? true : false
  }),
  graphql(gql(queries.boardDetail), {
    name: 'boardDetailQuery',
    skip: ({ queryParams }) => !queryParams.id,
    options: ({ queryParams }: { queryParams: { id: string } }) => ({ variables: { _id: queryParams.id } })
  })
)(Main);

export default MainContainer;
