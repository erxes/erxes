import { Stage as DealStage } from 'modules/deals/containers/stage';
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

export default React.memo(({ type, ...stageProps }: Props) => {
  switch (type) {
    case 'deal': {
      return <DealStage {...stageProps} />;
    }
  }

  return null;
});
