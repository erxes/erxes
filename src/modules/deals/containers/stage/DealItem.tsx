import { DealItem } from 'modules/deals/components/stage';
import { IDeal } from 'modules/deals/types';
import * as React from 'react';
import { PipelineConsumer } from '../PipelineContext';

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
      {({ onAddDeal, onRemoveDeal, onUpdateDeal }) => {
        return (
          <DealItem
            stageId={props.stageId}
            deal={props.deal}
            isDragging={props.isDragging}
            provided={props.provided}
            onTogglePopup={props.onTogglePopup}
            onAdd={onAddDeal}
            onRemove={onRemoveDeal}
            onUpdate={onUpdateDeal}
          />
        );
      }}
    </PipelineConsumer>
  );
};
