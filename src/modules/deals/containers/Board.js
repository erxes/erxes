import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { router as routerUtils } from 'modules/common/utils';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Board as BoardComponent } from '../components';

import { queries } from '../graphql';

class Container extends React.Component {
  componentWillReceiveProps() {
    const { history, currentBoardId } = this.props;

    if (!routerUtils.getParam(history, 'id') && currentBoardId) {
      routerUtils.setParams(history, { id: currentBoardId });
    }
  }

  render() {
    const { boardsQuery, pipelinesQuery, dealsQuery, stagesQuery } = this.props;

    const boards = boardsQuery.dealBoards || [];
    const pipelines = pipelinesQuery.dealPipelines || [];
    const stages = stagesQuery.dealStages || [];
    const deals = dealsQuery.deals || [];

    if (
      boardsQuery.loading ||
      pipelinesQuery.loading ||
      dealsQuery.loading ||
      stagesQuery.loading
    ) {
      return null;
    }

    const extendedProps = {
      ...this.props,
      boards,
      pipelines,
      stages,
      deals
    };

    return <BoardComponent {...extendedProps} />;
  }
}

const propTypes = {
  boardsQuery: PropTypes.object,
  pipelinesQuery: PropTypes.object,
  dealsQuery: PropTypes.object,
  stagesQuery: PropTypes.object,
  currentBoardId: PropTypes.string,
  history: PropTypes.object
};

Container.propTypes = propTypes;

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
  }),
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ currentBoardId }) => ({
      variables: {
        boardId: currentBoardId || ''
      }
    })
  }),
  graphql(gql(queries.deals), {
    name: 'dealsQuery',
    options: ({ currentBoardId }) => ({
      variables: {
        boardId: currentBoardId || ''
      }
    })
  })
)(Container);

const BoardDetail = props => {
  const { boardDetailQuery, currentBoardId } = props;

  const currentBoard = boardDetailQuery.dealBoardDetail || {};

  const extendedProps = {
    ...props,
    currentBoardId,
    currentBoard
  };

  return <BoardContainer {...extendedProps} />;
};

const boardDetailPropTypes = {
  boardDetailQuery: PropTypes.object,
  currentBoardId: PropTypes.string
};

BoardDetail.propTypes = boardDetailPropTypes;

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
