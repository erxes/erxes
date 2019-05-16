import { PipelineConsumer } from 'modules/boards/containers/PipelineContext';
import { DealItem } from 'modules/deals/components/stage';
import * as React from 'react';
import { IDeal } from '../../types';

type Props = {
  stageId: string;
  deal: IDeal;
  isDragging: boolean;
  provided;
  onTogglePopup: () => void;
};

export default (props: Props) => {
  return (
    <PipelineConsumer>
      {({ onAddItem, onRemoveItem, onUpdateItem }) => {
        return (
          <DealItem
            stageId={props.stageId}
            deal={props.deal}
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
