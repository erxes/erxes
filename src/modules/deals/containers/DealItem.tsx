import { PipelineConsumer } from 'modules/boards/containers/PipelineContext';
import { DealItem } from 'modules/deals/components/';
import * as React from 'react';
import { IDeal } from '../types';

type Props = {
  stageId: string;
  item: IDeal;
  isDragging: boolean;
  provided;
  onTogglePopup: () => void;
};

export default (props: Props) => {
  return (
    <PipelineConsumer>
      {({ onAddItem, onRemoveItem, onUpdateItem, options }) => {
        return (
          <DealItem
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
