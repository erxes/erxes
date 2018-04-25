import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { router as routerUtils } from 'modules/common/utils';
import { Home } from '../components';
import { queries } from '../graphql';

class HomeContainer extends React.Component {
  componentWillReceiveProps() {
    const { history, currentBoard } = this.props;

    if (!routerUtils.getParam(history, 'id') && currentBoard) {
      routerUtils.setParams(history, { id: currentBoard._id });
    }
  }

  render() {
    const { boardsQuery } = this.props;

    const boards = boardsQuery.dealBoards || [];

    const extendedProps = {
      ...this.props,
      boards
    };

    return <Home {...extendedProps} />;
  }
}

HomeContainer.propTypes = {
  boardsQuery: PropTypes.object,
  currentBoard: PropTypes.object,
  history: PropTypes.object
};

const HomeContainerWithData = compose(
  graphql(gql(queries.boards), {
    name: 'boardsQuery'
  })
)(HomeContainer);

const BoardDetail = props => {
  const { boardDetailQuery } = props;

  const currentBoard = boardDetailQuery.dealBoardDetail;

  const extendedProps = {
    ...props,
    currentBoard
  };

  return <HomeContainerWithData {...extendedProps} />;
};

BoardDetail.propTypes = {
  boardDetailQuery: PropTypes.object
};

const BoardDetailContainer = compose(
  graphql(gql(queries.boardDetail), {
    name: 'boardDetailQuery',
    options: ({ currentBoardId = '' }) => ({
      variables: { _id: currentBoardId }
    })
  })
)(BoardDetail);

/*
 * We will use this component when there is no current board id
 * in query string
 */
const DefaultBoard = props => {
  const { boardGetDefaultQuery } = props;

  const defaultBoard = boardGetDefaultQuery.dealBoardGetDefault;

  const extendedProps = {
    ...props,
    currentBoard: defaultBoard
  };

  return <HomeContainerWithData {...extendedProps} />;
};

DefaultBoard.propTypes = {
  boardGetDefaultQuery: PropTypes.object
};

const DefaultBoardContainer = compose(
  graphql(gql(queries.boardGetDefault), {
    name: 'boardGetDefaultQuery'
  })
)(DefaultBoard);

/*
 * Main board component
 */
const MainContainer = props => {
  const { history } = props;
  const currentBoardId = routerUtils.getParam(history, 'id');

  if (currentBoardId) {
    const extentedProps = {
      ...props,
      currentBoardId
    };

    return <BoardDetailContainer {...extentedProps} />;
  }

  return <DefaultBoardContainer {...props} />;
};

MainContainer.propTypes = {
  history: PropTypes.object
};

export default withRouter(MainContainer);
