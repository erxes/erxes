import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { DealMoveForm } from '../../components';
import { queries } from '../../graphql';

class DealMoveFormContainer extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeBoard = this.onChangeBoard.bind(this);
    this.onChangePipeline = this.onChangePipeline.bind(this);
    this.moveDeal = this.moveDeal.bind(this);

    const { boardId, pipelineId } = props;

    this.state = {
      boardId,
      pipelineId
    };
  }

  onChangeBoard(board) {
    // get value from react-select-plus component
    // it is unnecessary to check whether board is null or not
    // because this has at least one board (current board)
    const boardId = board.value;

    this.setState({ boardId });

    this.props.pipelinesQuery.refetch({ boardId }).then(({ data }) => {
      const pipelines = data.dealPipelines;

      if (pipelines.length > 0) {
        this.onChangePipeline(pipelines[0]._id);
      }
    });
  }

  onChangePipeline(pipeline) {
    if (pipeline) {
      // get value from react-select-plus component
      const pipelineId = pipeline.value;

      this.setState({ pipelineId });

      this.props.stagesQuery.refetch({ pipelineId });
    } else {
      this.setState({ pipelineId: null });
    }
  }

  moveDeal(doc) {
    const { deal } = this.props;

    const moveDoc = {
      source: { _id: deal.stageId, index: deal.order },
      destination: { _id: doc.stageId, index: 0 },
      itemId: deal._id,
      type: 'stage'
    };

    this.context.move(moveDoc);

    this.props.moveDeal({ _id: deal._id, ...doc });
  }

  render() {
    const { deal, boardsQuery, pipelinesQuery, stagesQuery } = this.props;
    const { boardId, pipelineId } = this.state;

    if (boardsQuery.loading || pipelinesQuery.loading || stagesQuery.loading) {
      return <Spinner objective />;
    }

    const boards = boardsQuery.dealBoards;
    const pipelines = pipelinesQuery.dealPipelines;
    const stages = stagesQuery.dealStages;

    let filteredStages = stages;

    if (this.props.pipelineId === pipelineId) {
      filteredStages = stages.filter(stage => stage._id !== deal.stageId);
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
  moveDeal: PropTypes.func,
  boardId: PropTypes.string,
  pipelineId: PropTypes.string
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
    options: ({ boardId }) => ({
      variables: {
        boardId
      }
    })
  }),
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ pipelineId }) => ({
      variables: {
        pipelineId
      }
    })
  })
)(DealMoveFormContainer);
