import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'modules/common/components';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { DealMoveForm } from '../../components';
import { queries } from '../../graphql';

class DealMoveFormContainer extends React.Component {
  constructor(props) {
    super(props);

    const deal = props.deal;

    this.onChangeBoard = this.onChangeBoard.bind(this);
    this.onChangePipeline = this.onChangePipeline.bind(this);
    this.moveDeal = this.moveDeal.bind(this);

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

  moveDeal(doc) {
    const { deal } = this.props;

    const moveDoc = {
      source: {
        _id: deal.stageId,
        index: deal.order
      },
      destination: {
        _id: doc.stageId,
        index: 0
      },
      itemId: doc._id,
      type: 'stage'
    };

    this.context.move(moveDoc);

    this.props.moveDeal(doc);
  }

  render() {
    const { deal, boardsQuery, pipelinesQuery, stagesQuery } = this.props;
    const { boardId, pipelineId } = this.state;

    if (boardsQuery.loading || pipelinesQuery.loading || stagesQuery.loading) {
      return <Spinner />;
    }

    const boards = boardsQuery.dealBoards;
    const pipelines = pipelinesQuery.dealPipelines;
    const stages = stagesQuery.dealStages;

    let filteredStages = stages;
    if (deal.pipelineId === pipelineId) {
      filteredStages = stages.filter(el => el._id !== deal.stageId);
    }

    const stageId = filteredStages.length > 0 ? filteredStages[0]._id : null;

    const extendedProps = {
      ...this.props,
      boards,
      pipelines,
      stages: filteredStages,
      boardId,
      stageId,
      pipelineId,
      onChangeBoard: this.onChangeBoard,
      onChangePipeline: this.onChangePipeline,
      moveDeal: this.moveDeal
    };

    return <DealMoveForm {...extendedProps} />;
  }
}

const propTypes = {
  boardsQuery: PropTypes.object,
  pipelinesQuery: PropTypes.object,
  stagesQuery: PropTypes.object,
  deal: PropTypes.object,
  moveDeal: PropTypes.func
};

DealMoveFormContainer.propTypes = propTypes;
DealMoveFormContainer.contextTypes = {
  move: PropTypes.func
};

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
  })
)(DealMoveFormContainer);
