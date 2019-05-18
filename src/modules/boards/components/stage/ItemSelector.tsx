import { DealItem } from 'modules/deals/containers/stage';
import * as React from 'react';
import { Item } from '../../types';

type Props = {
  stageId: string;
  item: Item;
  isDragging: boolean;
  provided;
  onTogglePopup: () => void;
  type: string;
};

export default React.memo(({ type, ...itemProps }: Props) => {
  switch (type) {
    case 'deal': {
      return <DealItem {...itemProps} />;
    }
  }

  return null;
});
