import { renderFullName } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import { DealIndicator } from 'modules/deals/styles/stage';
import * as React from 'react';
import { ICompany } from '../../../companies/types';
import { IProduct } from '../../../settings/productService/types';

type Props = {
  items: ICompany[] | IProduct[] | ICustomer[];
  color: string;
};

class Items extends React.Component<Props> {
  renderItem(item, color, index) {
    return (
      <div key={index}>
        <DealIndicator color={color} />
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

export default Items;
