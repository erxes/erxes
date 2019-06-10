import { IDeal } from 'modules/deals/types';
import * as React from 'react';

import DealItem from './DealItem';

type Props = {
  listId: string;
  listType?: string;
  stageId: string;
  deals: IDeal[];

  style?: any;
};

export default class DealList extends React.Component<Props> {
  static defaultProps = {
    listId: 'LIST'
  };

  render() {
    const { deals } = this.props;
    const contents = deals.map((deal, index) => (
      <DealItem key={index} deal={deal} />
    ));

    return <div>{contents}</div>;
  }
}
