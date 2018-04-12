import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { DealMove } from '../../components';
import { queries } from '../../graphql';

class DealMoveContainer extends React.Component {
  constructor(props) {
    super(props);

    this.toggleForm = this.toggleForm.bind(this);
    this.onChangeBoard = this.onChangeBoard.bind(this);
    this.onChangePipeline = this.onChangePipeline.bind(this);
    this.onChangeStage = this.onChangeStage.bind(this);

    const { deal: { boardId, pipelineId, stageId } } = props;

    this.state = {
      stageId,
      boardId,
      pipelineId,
      show: false
    };
  }

  toggleForm() {
    this.setState({ show: !this.state.show });
  }

  onChangeBoard(boardId) {
    this.setState({ boardId });

    this.props.pipelinesQuery.refetch({ boardId }).then(({ data }) => {
      const pipelines = data.dealPipelines;

      if (pipelines.length > 0) {
        this.onChangePipeline(pipelines[0]._id);
      }
    });
  }

  onChangePipeline(pipelineId) {
    this.setState({ pipelineId });

    this.props.stagesQuery.refetch({ pipelineId }).then(({ data }) => {
      const stages = data.dealStages;

      if (stages.length > 0) {
        this.onChangeStage(stages[0]._id);
      }
    });
  }

  onChangeStage(stageId, toggle) {
    this.setState({ stageId }, () => {
      this.props.onChangeStage(stageId);
    });

    if (toggle) this.toggleForm();
  }

  render() {
    const { boardsQuery, pipelinesQuery, stagesQuery } = this.props;
    const { boardId, pipelineId, stageId, show } = this.state;

    const boards = boardsQuery.dealBoards || [];
    const pipelines = pipelinesQuery.dealPipelines || [];
    const stages = stagesQuery.dealStages || [];

    const extendedProps = {
      ...this.props,
      boards,
      pipelines,
      stages,
      stageId,
      boardId,
      pipelineId,
      show,
      onChangeBoard: this.onChangeBoard,
      onChangePipeline: this.onChangePipeline,
      onChangeStage: this.onChangeStage,
      toggleForm: this.toggleForm
    };

    return <DealMove {...extendedProps} />;
  }
}

const propTypes = {
  boardsQuery: PropTypes.object,
  pipelinesQuery: PropTypes.object,
  stagesQuery: PropTypes.object,
  deal: PropTypes.object,
  onChangeStage: PropTypes.func
};

DealMoveContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.boards), {
    name: 'boardsQuery'
  }),
  graphql(gql(queries.pipelines), {
    name: 'pipelinesQuery',
    options: ({ deal: { boardId } }) => ({
      variables: {
        boardId
      }
    })
  }),
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ deal: { pipelineId } }) => ({
      variables: {
        pipelineId
      }
    })
  })
)(DealMoveContainer);
