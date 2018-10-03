import { EmptyState } from 'modules/common/components';
import * as React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';

import { Pipeline } from '../containers';
import { IBoard, IDragResult, IPipeline } from '../types';

type StateType = { [key: string]: number };

type Props = {
  currentBoard?: IBoard;
  pipelines: IPipeline[];
  states: StateType;
  onDragEnd: (result: IDragResult) => void;
  loading: boolean;
};

class Board extends React.Component<Props> {
  renderPipelines() {
    const { states, pipelines, currentBoard, loading } = this.props;

    if (pipelines && pipelines.length === 0 && !loading) {
      return (
        <EmptyState
          linkUrl={`/settings/deals?boardId=${currentBoard && currentBoard._id}`}
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
        index={index}
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

export default Board;
