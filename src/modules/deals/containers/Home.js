import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { router as routerUtils } from 'modules/common/utils';
import { Home } from '../components';
import { queries } from '../graphql';

/*
 * Main board component
 */
class Main extends React.Component {
  render() {
    const {
      history,
      queryParams,
      boardsQuery,
      boardGetDefaultQuery = {},
      boardDetailQuery = {}
    } = this.props;

    const currentBoard = boardDetailQuery.dealBoardDetail;
    const defaultBoard = boardGetDefaultQuery.dealBoardGetDefault;

    if (!queryParams.id && defaultBoard) {
      routerUtils.setParams(history, { id: defaultBoard._id });
      return null;
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
  boardGetDefaultQuery: PropTypes.object,
  boardDetailQuery: PropTypes.object
};

const MainContainer = compose(
  graphql(gql(queries.boards), {
    name: 'boardsQuery'
  }),
  graphql(gql(queries.boardGetDefault), {
    name: 'boardGetDefaultQuery',
    options: ({ queryParams }) => ({
      skip: queryParams.id
    })
  }),
  graphql(gql(queries.boardDetail), {
    name: 'boardDetailQuery',
    options: ({ queryParams }) => ({
      skip: !queryParams.id,
      variables: { _id: queryParams.id }
    })
  })
)(Main);

export default MainContainer;
