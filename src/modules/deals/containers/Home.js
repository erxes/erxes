import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { router as routerUtils } from 'modules/common/utils';
import {
  STORAGE_BOARD_KEY,
  STORAGE_PIPELINE_KEY
} from 'modules/common/constants';
import { Home } from '../components';
import { queries } from '../graphql';

const storageBoardId = localStorage.getItem(STORAGE_BOARD_KEY);

/*
 * Main board component
 */
class Main extends React.Component {
  render() {
    const {
      history,
      queryParams,
      boardsQuery,
      boardGetLastQuery = {},
      boardDetailQuery = {}
    } = this.props;

    const currentBoard = boardDetailQuery.dealBoardDetail;

    if (!queryParams.id) {
      let boardId = storageBoardId;

      const lastBoard = boardGetLastQuery.dealBoardGetLast;

      if (!boardId && lastBoard) {
        boardId = lastBoard._id;
      }

      if (boardId) {
        routerUtils.setParams(history, { id: boardId });
        return null;
      }
    } else {
      localStorage.setItem(STORAGE_BOARD_KEY, queryParams.id);
      localStorage.setItem(STORAGE_PIPELINE_KEY, null);
    }

    const extendedProps = {
      ...this.props,
      currentBoard,
      boards: boardsQuery.dealBoards || []
    };

    return <Home {...extendedProps} />;
  }
}

Main.propTypes = {
  history: PropTypes.object,
  queryParams: PropTypes.object,
  boardsQuery: PropTypes.object,
  boardGetLastQuery: PropTypes.object,
  boardDetailQuery: PropTypes.object
};

const MainContainer = compose(
  graphql(gql(queries.boards), {
    name: 'boardsQuery'
  }),
  graphql(gql(queries.boardGetLast), {
    name: 'boardGetLastQuery',
    skip: () => storageBoardId
  }),
  graphql(gql(queries.boardDetail), {
    name: 'boardDetailQuery',
    skip: ({ queryParams }) => !queryParams.id,
    options: ({ queryParams }) => ({ variables: { _id: queryParams.id } })
  })
)(Main);

export default MainContainer;
