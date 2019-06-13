import { PipelineConsumer } from 'modules/boards/containers/PipelineContext';
import * as React from 'react';
import { TaskItem } from '../components/';
import { ITask } from '../types';

type Props = {
  stageId: string;
  item: ITask;
  isDragging: boolean;
  provided;
  onTogglePopup: () => void;
};

export default (props: Props) => {
  return (
    <PipelineConsumer>
      {({ onAddItem, onRemoveItem, onUpdateItem, options }) => {
        return (
          <TaskItem
            options={options}
            stageId={props.stageId}
            item={props.item}
            isDragging={props.isDragging}
            provided={props.provided}
            onTogglePopup={props.onTogglePopup}
            onAdd={onAddItem}
            onRemove={onRemoveItem}
            onUpdate={onUpdateItem}
          />
        );
      }}
    </PipelineConsumer>
  );
};
