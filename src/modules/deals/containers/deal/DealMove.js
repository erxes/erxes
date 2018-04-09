import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { DealMove } from '../../components';
import { queries } from '../../graphql';

class DealMoveContainer extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeBoard = this.onChangeBoard.bind(this);
    this.onChangePipeline = this.onChangePipeline.bind(this);
    this.moveDeal = this.moveDeal.bind(this);

    const { deal } = props;

    this.state = {
      boardId: deal.board._id,
      pipelineId: deal.pipeline._id
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
      itemId: doc._id,
      type: 'stage'
    };

    this.context.move(moveDoc);

    this.props.moveDeal(doc);
  }

  render() {
    const { boardsQuery, pipelinesQuery, stagesQuery } = this.props;
    const { boardId, pipelineId } = this.state;

    if (boardsQuery.loading || pipelinesQuery.loading || stagesQuery.loading) {
      return <Spinner objective />;
    }

    const boards = boardsQuery.dealBoards;
    const pipelines = pipelinesQuery.dealPipelines;
    const stages = stagesQuery.dealStages;

    const extendedProps = {
      ...this.props,
      boards,
      pipelines,
      stages,
      boardId,
      pipelineId,
      onChangeBoard: this.onChangeBoard,
      onChangePipeline: this.onChangePipeline,
      moveDeal: this.moveDeal
    };

    return <DealMove {...extendedProps} />;
  }
}

const propTypes = {
  boardsQuery: PropTypes.object,
  pipelinesQuery: PropTypes.object,
  stagesQuery: PropTypes.object,
  deal: PropTypes.object,
  moveDeal: PropTypes.func
};

DealMoveContainer.propTypes = propTypes;
DealMoveContainer.contextTypes = {
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
        boardId: deal.board._id
      }
    })
  }),
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ deal }) => ({
      variables: {
        pipelineId: deal.pipeline._id
      }
    })
  })
)(DealMoveContainer);
