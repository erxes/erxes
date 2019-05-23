import { DealItem } from 'modules/deals/containers/stage';
import * as React from 'react';
import { Item as ItemType } from '../../types';

type Props = {
  stageId: string;
  item: ItemType;
  isDragging: boolean;
  provided;
  onTogglePopup: () => void;
  type: string;
};

const ITEMS = {
  deal: DealItem
};

export default ({ type, ...itemProps }: Props) => {
  const Item = ITEMS[type];

  return <Item {...itemProps} />;
};
