import { renderFullName } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import { ICustomer } from 'modules/customers/types';
import { IProduct } from 'modules/settings/productService/types';
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
