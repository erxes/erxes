import React from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-beautiful-dnd';
import { EmptyState } from 'modules/common/components';
import { Pipeline } from '../containers';

const propTypes = {
  currentBoard: PropTypes.object,
  pipelines: PropTypes.array,
  states: PropTypes.object,
  onDragEnd: PropTypes.func,
  loading: PropTypes.bool
};

class Board extends React.Component {
  renderPipelines() {
    const { states, pipelines, currentBoard, loading } = this.props;

    if (pipelines && pipelines.length === 0 && !loading) {
      return (
        <EmptyState
          linkUrl={`/settings/deals?boardId=${currentBoard._id}`}
          linkText="Create one"
          size="full"
          text="There is no pipeline in this board."
          image="/images/robots/robot-05.svg"
        />
      );
    }

    const stageStates = {};

    if (states) {
      Object.keys(states).forEach(key => {
        if (key.startsWith('stageState')) {
          stageStates[key] = states[key];
        }
      });
    }

    return pipelines.map((pipeline, index) => (
      <Pipeline
        key={pipeline._id}
        {...stageStates}
        expanded={index < 2}
        state={states[`pipelineState${pipeline._id}`]}
        pipeline={pipeline}
      />
    ));
  }

  render() {
    const { currentBoard, onDragEnd } = this.props;

    if (!currentBoard) {
      return (
        <EmptyState
          linkUrl="/settings/deals"
          linkText="Create one"
          size="full"
          text="There is no board"
          image="/images/robots/robot-05.svg"
        />
      );
    }

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        {this.renderPipelines()}
      </DragDropContext>
    );
  }
}

Board.propTypes = propTypes;
Board.contextTypes = {
  __: PropTypes.func
};

export default Board;
