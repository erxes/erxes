import { PipelineConsumer } from 'modules/boards/containers/PipelineContext';
import React from 'react';
import GrowthHackItem from '../components/GrowthHackItem';
import { IGrowthHack } from '../types';

type Props = {
  stageId: string;
  item: IGrowthHack;
  isDragging: boolean;
  provided;
  onTogglePopup: () => void;
};

export default (props: Props) => {
  return (
    <PipelineConsumer>
      {({ onAddItem, onRemoveItem, onUpdateItem, options }) => {
        return (
          <GrowthHackItem
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
