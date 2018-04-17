import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { DealSelect } from '../../components';
import { queries } from '../../graphql';

class DealSelectContainer extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeBoard = this.onChangeBoard.bind(this);
    this.onChangePipeline = this.onChangePipeline.bind(this);
    this.onChangeStage = this.onChangeStage.bind(this);
  }

  onChangeBoard(boardId) {
    this.props.onChangeBoard(boardId);

    this.props.pipelinesQuery.refetch({ boardId }).then(({ data }) => {
      const pipelines = data.dealPipelines;

      if (pipelines.length > 0) {
        this.onChangePipeline(pipelines[0]._id);
      }
    });
  }

  onChangePipeline(pipelineId) {
    this.props.onChangePipeline(pipelineId);

    const { stagesQuery, onChangeStages } = this.props;

    stagesQuery.refetch({ pipelineId }).then(({ data }) => {
      const stages = data.dealStages;

      if (stages.length > 0 && onChangeStages) {
        onChangeStages(stages);
        this.onChangeStage(stages[0]._id);
      }
    });
  }

  onChangeStage(stageId, callback) {
    this.props.onChangeStage(stageId);

    if (callback) callback();
  }

  render() {
    const { boardsQuery, pipelinesQuery, stagesQuery } = this.props;

    const boards = boardsQuery.dealBoards || [];
    const pipelines = pipelinesQuery.dealPipelines || [];
    const stages = stagesQuery.dealStages || [];

    const extendedProps = {
      ...this.props,
      boards,
      pipelines,
      stages,
      onChangeBoard: this.onChangeBoard,
      onChangePipeline: this.onChangePipeline,
      onChangeStage: this.onChangeStage
    };

    return <DealSelect {...extendedProps} />;
  }
}

DealSelectContainer.propTypes = {
  boardsQuery: PropTypes.object,
  pipelinesQuery: PropTypes.object,
  stagesQuery: PropTypes.object,
  onChangeStage: PropTypes.func,
  onChangePipeline: PropTypes.func,
  onChangeBoard: PropTypes.func,
  onChangeStages: PropTypes.func
};

const DealSelectWithData = compose(
  graphql(gql(queries.boards), {
    name: 'boardsQuery'
  }),
  graphql(gql(queries.pipelines), {
    name: 'pipelinesQuery',
    options: ({ boardId }) => ({
      variables: { boardId }
    })
  }),
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ pipelineId }) => ({
      variables: { pipelineId }
    })
  })
)(DealSelectContainer);

const DealSectionGetLastPipelineContainer = props => {
  const { pipelineGetLastQuery } = props;

  if (pipelineGetLastQuery.loading) {
    return null;
  }

  const pipeline = pipelineGetLastQuery.dealPipelineGetLast;

  const extendedProps = {
    ...props,
    pipelineId: pipeline._id
  };

  return <DealSelectWithData {...extendedProps} />;
};

DealSectionGetLastPipelineContainer.propTypes = {
  pipelineGetLastQuery: PropTypes.object
};

const DealSectionGetLastPipeline = compose(
  graphql(gql(queries.pipelineGetLast), {
    name: 'pipelineGetLastQuery',
    options: ({ boardId }) => ({
      variables: {
        boardId
      }
    })
  })
)(DealSectionGetLastPipelineContainer);

const MainContainer = props => {
  const { pipelineId } = props;

  if (!pipelineId) {
    return <DealSectionGetLastPipeline {...props} />;
  }

  return <DealSelectWithData {...props} />;
};

MainContainer.propTypes = {
  boardId: PropTypes.string,
  pipelineId: PropTypes.string
};

export default MainContainer;
