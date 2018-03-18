import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert, confirm } from 'modules/common/utils';
import { Home } from '../components';
import { queries, mutations } from '../graphql';
import { router as routerUtils } from 'modules/common/utils';

class HomeWithCurrent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stages: []
    };
  }

  componentWillReceiveProps() {
    const { history, boardId } = this.props;

    if (!routerUtils.getParam(history, 'boardId') && boardId) {
      routerUtils.setParams(history, { boardId });
    }
  }

  render() {
    const {
      pipelinesQuery,
      location,
      boardId,
      addPipelineMutation,
      editPipelineMutation,
      removePipelineMutation
    } = this.props;

    const pipelines = pipelinesQuery.dealPipelines || [];

    // remove action
    const removePipeline = _id => {
      confirm().then(() => {
        removePipelineMutation({
          variables: { _id }
        })
          .then(() => {
            pipelinesQuery.refetch();

            Alert.success('Successfully deleted.');
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    // create or update action
    const savePipeline = ({ doc }, callback, pipeline) => {
      let mutation = addPipelineMutation;
      // if edit mode
      if (pipeline) {
        mutation = editPipelineMutation;
        doc._id = pipeline._id;
      }

      mutation({
        variables: doc
      })
        .then(() => {
          pipelinesQuery.refetch();

          Alert.success('Successfully saved!');

          callback();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const extendedProps = {
      ...this.props,
      pipelines,
      queryParams: queryString.parse(location.search),
      refetch: pipelinesQuery.refetch,
      loading: pipelinesQuery.loading,
      boardId,
      removePipeline,
      savePipeline
    };

    return <Home {...extendedProps} />;
  }
}

HomeWithCurrent.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  pipelinesQuery: PropTypes.object,
  boardId: PropTypes.string,
  addPipelineMutation: PropTypes.func,
  editPipelineMutation: PropTypes.func,
  removePipelineMutation: PropTypes.func
};

const HomeContainer = compose(
  graphql(gql(queries.pipelines), {
    name: 'pipelinesQuery',
    options: ({ boardId }) => ({
      variables: { boardId: boardId || '' }
    })
  }),
  graphql(gql(mutations.pipelineAdd), {
    name: 'addPipelineMutation'
  }),
  graphql(gql(mutations.pipelineEdit), {
    name: 'editPipelineMutation'
  }),
  graphql(gql(mutations.pipelineRemove), {
    name: 'removePipelineMutation'
  })
)(HomeWithCurrent);

//Getting lastBoard id to currentBoard
const BoardWithLast = props => {
  const { lastBoardQuery } = props;
  const lastBoard = lastBoardQuery.dealBoardGetLast || {};
  const extendedProps = { ...props, boardId: lastBoard._id };

  return <HomeContainer {...extendedProps} />;
};

BoardWithLast.propTypes = {
  lastBoardQuery: PropTypes.object
};

const BoardWithLastContainer = compose(
  graphql(gql(queries.boardsGetLast), {
    name: 'lastBoardQuery'
  })
)(BoardWithLast);

// Main home component
const MainContainer = props => {
  const { history } = props;
  const boardId = routerUtils.getParam(history, 'boardId');

  if (boardId) {
    const extendedProps = { ...props, boardId };

    return <HomeContainer {...extendedProps} />;
  }

  return <BoardWithLastContainer {...props} />;
};

MainContainer.propTypes = {
  history: PropTypes.object
};

export default withRouter(MainContainer);
