import { DealItem } from 'modules/deals/containers/';
import { TicketItem } from 'modules/tickets/containers/';
import * as React from 'react';
import { IOptions, Item as ItemType } from '../../types';

type Props = {
  stageId: string;
  item: ItemType;
  isDragging: boolean;
  provided;
  onTogglePopup: () => void;
  options: IOptions;
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
    const { options, ...itemProps } = this.props;

    const Item = this.ITEMS[options.type];

    return <Item {...itemProps} />;
  }
}
