import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { router as routerUtils } from 'modules/common/utils';
import { Spinner } from 'modules/common/components';
import { Board as BoardComponent } from '../components';
import { queries } from '../graphql';

class Container extends React.Component {
  constructor(props) {
    super(props);

    this.move = this.move.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);

    this.state = {};
  }

  componentWillReceiveProps() {
    const { history, currentBoardId } = this.props;

    if (!routerUtils.getParam(history, 'id') && currentBoardId) {
      routerUtils.setParams(history, { id: currentBoardId });
    }
  }

  getChildContext() {
    return {
      move: this.move
    };
  }

  move({ source, destination, itemId, type }) {
    this.setState({
      // remove from list
      [`${type}State${source._id}`]: {
        type: 'removeItem',
        index: source.index
      }
    });

    this.setState({
      // add to list
      [`${type}State${destination._id}`]: {
        type: 'addItem',
        index: destination.index,
        itemId
      }
    });
  }

  onDragEnd(result) {
    const { type, destination, source, draggableId } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    this.move({
      source: { _id: source.droppableId, index: source.index },
      destination: { _id: destination.droppableId, index: destination.index },
      itemId: draggableId,
      type
    });
  }

  render() {
    const { boardsQuery, pipelinesQuery } = this.props;

    if (boardsQuery.loading || pipelinesQuery.loading) {
      return <Spinner />;
    }

    const boards = boardsQuery.dealBoards;
    const pipelines = pipelinesQuery.dealPipelines;

    const extendedProps = {
      ...this.props,
      states: this.state,
      onDragEnd: this.onDragEnd,
      boards,
      pipelines
    };

    return <BoardComponent {...extendedProps} />;
  }
}

Container.propTypes = {
  boardsQuery: PropTypes.object,
  pipelinesQuery: PropTypes.object,
  currentBoardId: PropTypes.string,
  history: PropTypes.object
};

Container.childContextTypes = {
  move: PropTypes.func
};

const BoardContainer = compose(
  graphql(gql(queries.boards), {
    name: 'boardsQuery'
  }),
  graphql(gql(queries.pipelines), {
    name: 'pipelinesQuery',
    options: ({ currentBoardId }) => ({
      variables: {
        boardId: currentBoardId || ''
      }
    })
  })
)(Container);

const BoardDetail = props => {
  const { boardDetailQuery } = props;

  const currentBoard = boardDetailQuery.dealBoardDetail || {};

  const extendedProps = {
    ...props,
    currentBoard
  };

  return <BoardContainer {...extendedProps} />;
};

BoardDetail.propTypes = {
  boardDetailQuery: PropTypes.object
};

const BoardDetailContainer = compose(
  graphql(gql(queries.boardDetail), {
    name: 'boardDetailQuery',
    options: ({ currentBoardId }) => ({
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-and-network',
      variables: { _id: currentBoardId || '' }
    })
  })
)(BoardDetail);

/*
 * We will use this component when there is not current board id
 * in query string
 */
const LastBoard = props => {
  const { dealBoardGetLastQuery } = props;

  const lastBoard = dealBoardGetLastQuery.dealBoardGetLast || {};

  const currentBoardId = lastBoard._id || '';

  const extendedProps = {
    ...props,
    currentBoardId,
    currentBoard: lastBoard
  };

  return <BoardContainer {...extendedProps} />;
};

LastBoard.propTypes = {
  dealBoardGetLastQuery: PropTypes.object
};

const LastBoardContainer = compose(
  graphql(gql(queries.boardGetLast), {
    name: 'dealBoardGetLastQuery'
  })
)(LastBoard);

/*
 * Main board component
 */
const Board = props => {
  const { history } = props;
  const currentBoardId = routerUtils.getParam(history, 'id');

  if (currentBoardId) {
    const extentedProps = {
      ...props,
      currentBoardId
    };

    return <BoardDetailContainer {...extentedProps} />;
  }

  return <LastBoardContainer {...props} />;
};

Board.propTypes = {
  history: PropTypes.object
};

export default withRouter(Board);
