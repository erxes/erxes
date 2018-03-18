import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'modules/common/components';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { DealMoveForm } from '../../components';
import { Alert } from 'modules/common/utils';

import { queries, mutations } from '../../graphql';

class DealMoveFormContainer extends React.Component {
  constructor(props) {
    super(props);

    const deal = props.deal;

    this.onChangeBoard = this.onChangeBoard.bind(this);
    this.onChangePipeline = this.onChangePipeline.bind(this);

    this.state = {
      boardId: deal.boardId,
      pipelineId: deal.pipelineId
    };
  }

  onChangeBoard(boardId) {
    this.setState({
      boardId
    });

    this.props.pipelinesQuery
      .refetch({
        boardId
      })
      .then(({ data }) => {
        const pipelines = data.dealPipelines;
        if (pipelines.length > 0) {
          this.onChangePipeline(pipelines[0]._id);
        }
      });
  }

  onChangePipeline(pipelineId) {
    this.setState({
      pipelineId
    });

    this.props.stagesQuery.refetch({
      pipelineId
    });
  }

  render() {
    const {
      deal,
      boardsQuery,
      pipelinesQuery,
      stagesQuery,
      dealsQuery,
      dealsChangeMutation
    } = this.props;
    const { boardId, pipelineId } = this.state;

    if (boardsQuery.loading || pipelinesQuery.loading || stagesQuery.loading) {
      return <Spinner />;
    }

    const move = (doc, callback) => {
      dealsChangeMutation({
        variables: doc
      })
        .then(({ data }) => {
          Alert.success('Successfully moved.');

          dealsQuery.refetch({ stageId: data.dealsChange.stageId });

          callback();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const boards = boardsQuery.dealBoards;
    const pipelines = pipelinesQuery.dealPipelines;
    const stages = stagesQuery.dealStages;

    let filteredStages = stages;
    if (deal.pipelineId === pipelineId) {
      filteredStages = stages.filter(el => el._id !== deal.stageId);
    }

    const extendedProps = {
      ...this.props,
      boards,
      pipelines,
      stages: filteredStages,
      boardId,
      stageId: filteredStages[0]._id,
      pipelineId,
      onChangeBoard: this.onChangeBoard,
      onChangePipeline: this.onChangePipeline,
      move
    };

    return <DealMoveForm {...extendedProps} />;
  }
}

const propTypes = {
  boardsQuery: PropTypes.object,
  pipelinesQuery: PropTypes.object,
  stagesQuery: PropTypes.object,
  dealsQuery: PropTypes.object,
  dealsChangeMutation: PropTypes.func,
  deal: PropTypes.object
};

DealMoveFormContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.boards), {
    name: 'boardsQuery'
  }),
  graphql(gql(queries.pipelines), {
    name: 'pipelinesQuery',
    options: ({ deal }) => ({
      variables: {
        boardId: deal.boardId
      }
    })
  }),
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ deal }) => ({
      variables: {
        pipelineId: deal.pipelineId
      }
    })
  }),
  graphql(gql(mutations.dealsChange), {
    name: 'dealsChangeMutation'
  }),
  graphql(gql(queries.deals), {
    name: 'dealsQuery',
    options: ({ stageId }) => ({
      variables: {
        stageId: stageId || ''
      }
    })
  })
)(DealMoveFormContainer);
