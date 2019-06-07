import { PipelineConsumer } from 'modules/boards/containers/PipelineContext';
import { Item } from 'modules/boards/types';
import { TicketItem } from 'modules/tickets/components/';
import * as React from 'react';

type Props = {
  stageId: string;
  item: Item;
  isDragging: boolean;
  provided;
  onTogglePopup: () => void;
};

export default (props: Props) => {
  return (
    <PipelineConsumer>
      {({ onAddItem, onRemoveItem, onUpdateItem, options }) => {
        return (
          <TicketItem
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
