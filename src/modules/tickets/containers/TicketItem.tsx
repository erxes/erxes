import { PipelineConsumer } from 'modules/boards/containers/PipelineContext';
import TicketItem from 'modules/tickets/components/TicketItem';
import React from 'react';
import { ITicket } from '../types';

type Props = {
  stageId: string;
  item: ITicket;
  isFormVisible: boolean;
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
            isFormVisible={props.isFormVisible}
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
