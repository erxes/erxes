import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { router as routerUtils, Alert } from 'modules/common/utils';
import { Spinner } from 'modules/common/components';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Board as BoardComponent } from '../components';

import { queries, mutations } from '../graphql';

class Container extends React.Component {
  componentWillReceiveProps() {
    const { history, currentBoardId } = this.props;

    if (!routerUtils.getParam(history, 'id') && currentBoardId) {
      routerUtils.setParams(history, { id: currentBoardId });
    }
  }

  render() {
    const {
      boardsQuery,
      pipelinesQuery,
      stagesQuery,
      dealsQuery,
      dealsUpdateOrderMutation,
      stagesUpdateOrderMutation,
      dealsChangeMutation,
      stagesChangeMutation
    } = this.props;

    const boards = boardsQuery.dealBoards || [];
    const pipelines = pipelinesQuery.dealPipelines || [];
    const stages = stagesQuery.dealStages || [];
    const deals = dealsQuery.deals || [];

    if (
      boardsQuery.loading ||
      pipelinesQuery.loading ||
      stagesQuery.loading ||
      dealsQuery.loading
    ) {
      return <Spinner />;
    }

    const dealsUpdateOrder = orders => {
      dealsUpdateOrderMutation({
        variables: { orders }
      }).catch(error => {
        Alert.error(error.message);
      });
    };

    const stagesUpdateOrder = orders => {
      stagesUpdateOrderMutation({
        variables: { orders }
      }).catch(error => {
        Alert.error(error.message);
      });
    };

    // if move to other stage, will change stageId and pipelineId
    const dealsChange = (_id, stageId, pipelineId) => {
      dealsChangeMutation({
        variables: { _id, stageId, pipelineId }
      })
        .then(() => {
          dealsQuery.refetch();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    // if move to other pipeline, will change pipelineId
    const stagesChange = (_id, pipelineId) => {
      stagesChangeMutation({
        variables: { _id, pipelineId }
      }).catch(error => {
        Alert.error(error.message);
      });
    };

    const extendedProps = {
      ...this.props,
      boards,
      pipelines,
      stages,
      deals,
      dealsRefetch: dealsQuery.refetch,
      dealsUpdateOrder,
      stagesUpdateOrder,
      dealsChange,
      stagesChange
    };

    return <BoardComponent {...extendedProps} />;
  }
}

const propTypes = {
  boardsQuery: PropTypes.object,
  pipelinesQuery: PropTypes.object,
  dealsUpdateOrderMutation: PropTypes.func,
  stagesUpdateOrderMutation: PropTypes.func,
  dealsChangeMutation: PropTypes.func,
  stagesChangeMutation: PropTypes.func,
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
  }),
  graphql(gql(mutations.dealsUpdateOrder), {
    name: 'dealsUpdateOrderMutation'
  }),
  graphql(gql(mutations.stagesUpdateOrder), {
    name: 'stagesUpdateOrderMutation'
  }),
  graphql(gql(mutations.dealsChange), {
    name: 'dealsChangeMutation'
  }),
  graphql(gql(mutations.stagesChange), {
    name: 'stagesChangeMutation'
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
