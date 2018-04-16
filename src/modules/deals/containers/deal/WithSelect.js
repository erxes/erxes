import React from 'react';
import PropTypes from 'prop-types';

export default function withSelect(WrappedComponent, params) {
  const WithSelect = class extends React.Component {
    constructor(props) {
      super(props);

      this.onChangeBoard = this.onChangeBoard.bind(this);
      this.onChangePipeline = this.onChangePipeline.bind(this);
      this.onChangeStage = this.onChangeStage.bind(this);

      const { boardId, pipelineId, stageId } = params;

      this.state = {
        stageId,
        boardId,
        pipelineId
      };
    }

    onChangeBoard(boardId) {
      this.setState({ boardId });

      params.pipelinesQuery.refetch({ boardId }).then(({ data }) => {
        const pipelines = data.dealPipelines;

        if (pipelines.length > 0) {
          this.onChangePipeline(pipelines[0]._id);
        }
      });
    }

    onChangePipeline(pipelineId) {
      this.setState({ pipelineId });

      params.stagesQuery.refetch({ pipelineId }).then(({ data }) => {
        const stages = data.dealStages;

        if (stages.length > 0) {
          this.onChangeStage(stages[0]._id);
        }
      });
    }

    onChangeStage(stageId, callback) {
      this.setState({ stageId }, () => {
        if (callback) callback();
      });
    }

    render() {
      const { boardsQuery, pipelinesQuery, stagesQuery } = params;
      const { boardId, pipelineId, stageId } = this.state;

      const boards = boardsQuery.dealBoards || [];
      const pipelines = pipelinesQuery.dealPipelines || [];
      const stages = stagesQuery.dealStages || [];

      const extendedProps = {
        ...params,
        boards,
        pipelines,
        stages,
        stageId,
        boardId,
        pipelineId,
        onChangeBoard: this.onChangeBoard,
        onChangePipeline: this.onChangePipeline,
        onChangeStage: this.onChangeStage
      };

      return <WrappedComponent {...extendedProps} />;
    }
  };

  WithSelect.displayName = 'WithSelectComponent';

  WithSelect.propTypes = {
    boardsQuery: PropTypes.object,
    pipelinesQuery: PropTypes.object,
    stagesQuery: PropTypes.object,
    boardId: PropTypes.string,
    pipelineId: PropTypes.string,
    stageId: PropTypes.string
  };

  return WithSelect;
}
