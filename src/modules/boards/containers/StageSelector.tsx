import { Stage as DealStage } from 'modules/deals/containers/stage';
import { Stage as TicketStage } from 'modules/tickets/containers';
import * as React from 'react';
import { IStage, Item } from '../types';

type Props = {
  stage: IStage;
  index: number;
  loadingState: 'readyToLoad' | 'loaded';
  items: Item[];
  length: number;
  search?: string;
  type: string;
};

const STAGES = {
  deal: DealStage,
  ticket: TicketStage
};

export default ({ type, ...stageProps }: Props) => {
  const Stage = STAGES[type];

  return <Stage {...stageProps} />;
};
