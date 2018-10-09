import { DealItem } from 'modules/deals/components/stage';
import { IDeal } from 'modules/deals/types';
import * as React from 'react';
import { PipelineConsumer } from '../PipelineContext';

type Props = {
  stageId: string;
  deal: IDeal;
  index: number;
  isDragging: boolean;
  provided;
};

export default (props: Props) => {
  return (
    <PipelineConsumer>
      {({ onAddDeal, onRemoveDeal, onUpdateDeal }) => {
        return (
          <DealItem
            {...props}
            onAdd={onAddDeal}
            onRemove={onRemoveDeal}
            onUpdate={onUpdateDeal}
          />
        );
      }}
    </PipelineConsumer>
  );
};
