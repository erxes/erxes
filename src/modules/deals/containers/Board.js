import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { router as routerUtils } from 'modules/common/utils';
import { Spinner } from 'modules/common/components';
import { Board } from '../components';
import { queries } from '../graphql';

class BoardContainer extends React.Component {
  constructor(props) {
    super(props);

    this.move = this.move.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);

    this.state = {};
  }

  componentWillReceiveProps() {
    const { history, currentBoard } = this.props;

    if (!routerUtils.getParam(history, 'id') && currentBoard) {
      routerUtils.setParams(history, { id: currentBoard._id });
    }
  }

  getChildContext() {
    const { currentBoard } = this.props;

    return { move: this.move, boardId: currentBoard ? currentBoard._id : '' };
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
    if (!destination) return;

    this.move({
      source: { _id: source.droppableId, index: source.index },
      destination: { _id: destination.droppableId, index: destination.index },
      itemId: draggableId,
      type
    });
  }

  render() {
    const { boardsQuery, pipelinesQuery } = this.props;

    if (pipelinesQuery.loading) {
      return <Spinner />;
    }

    const boards = boardsQuery.dealBoards || [];
    const pipelines = pipelinesQuery.dealPipelines;

    const extendedProps = {
      ...this.props,
      states: this.state,
      onDragEnd: this.onDragEnd,
      boards,
      pipelines,
      loading: pipelinesQuery.loading
    };

    return <Board {...extendedProps} />;
  }
}

BoardContainer.propTypes = {
  boardsQuery: PropTypes.object,
  pipelinesQuery: PropTypes.object,
  currentBoard: PropTypes.object,
  history: PropTypes.object
};

BoardContainer.childContextTypes = {
  move: PropTypes.func,
  boardId: PropTypes.string
};

const BoardContainerWithData = compose(
  graphql(gql(queries.boards), {
    name: 'boardsQuery'
  }),
  graphql(gql(queries.pipelines), {
    name: 'pipelinesQuery',
    options: ({ currentBoard }) => ({
      variables: { boardId: currentBoard ? currentBoard._id : '' },
      fetchPolicy: 'cache-and-network'
    })
  })
)(BoardContainer);

const BoardDetail = props => {
  const { boardDetailQuery } = props;

  if (boardDetailQuery.loading) {
    return <Spinner />;
  }

  const currentBoard = boardDetailQuery.dealBoardDetail;

  const extendedProps = {
    ...props,
    currentBoard
  };

  return <BoardContainerWithData {...extendedProps} />;
};

BoardDetail.propTypes = {
  boardDetailQuery: PropTypes.object
};

const BoardDetailContainer = compose(
  graphql(gql(queries.boardDetail), {
    name: 'boardDetailQuery',
    options: ({ currentBoardId }) => ({
      fetchPolicy: 'network-only',
      variables: { _id: currentBoardId || '' }
    })
  })
)(BoardDetail);

/*
 * We will use this component when there is no current board id
 * in query string
 */
const DefaultBoard = props => {
  const { boardGetDefaultQuery } = props;

  if (boardGetDefaultQuery.loading) {
    return <Spinner />;
  }

  const defaultBoard = boardGetDefaultQuery.dealBoardGetDefault;

  const extendedProps = {
    ...props,
    currentBoard: defaultBoard
  };

  return <BoardContainerWithData {...extendedProps} />;
};

DefaultBoard.propTypes = {
  boardGetDefaultQuery: PropTypes.object
};

const DefaultBoardContainer = compose(
  graphql(gql(queries.boardGetDefault), {
    name: 'boardGetDefaultQuery',
    options: () => ({ fetchPolicy: 'network-only' })
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
