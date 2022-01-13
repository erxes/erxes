import { renderFullName } from '@erxes/ui/src/utils';
import { ICompany } from '@erxes/ui/src/companies/types';
import { ICustomer } from '@erxes/ui/src/customers/types';
import { IProduct } from '@erxes/ui-products/src/types';
import React from 'react';
import { ItemIndicator } from '../styles/stage';

type Props = {
  items: ICompany[] | ICustomer[] | IProduct[];
  color: string;
};

class Details extends React.Component<Props> {
  renderItem(item, color, index) {
    return (
      <div key={index}>
        <ItemIndicator color={color} />
        {item.name || item.primaryName || renderFullName(item)}
      </div>
    );
  }

  renderItems(items) {
    const { color } = this.props;

    return items.map((item, index) => this.renderItem(item, color, index));
  }

  render() {
    const { items } = this.props;
    const length = items.length;

    if (length === 0) {
      return null;
    }

    return <>{this.renderItems(items)}</>;
  }
}

export default Details;
