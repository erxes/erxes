import { DealItem } from 'modules/deals/containers/';
import { TicketItem } from 'modules/tickets/containers/';
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

export default class extends React.Component<Props> {
  private ITEMS;

  constructor(props) {
    super(props);

    this.ITEMS = {
      deal: DealItem,
      ticket: TicketItem
    };
  }

  render() {
    const { type, ...itemProps } = this.props;

    const Item = this.ITEMS[type];

    return <Item {...itemProps} />;
  }
}
