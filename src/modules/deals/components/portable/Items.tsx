import { renderFullName } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import { PortableItem } from 'modules/deals/styles/deal';
import * as React from 'react';
import { ICompany } from '../../../companies/types';
import { IProduct } from '../../../settings/productService/types';

type Props = {
  items: ICompany[] | IProduct[] | ICustomer[];
  uppercase?: boolean;
  color: string;
};

class Items extends React.Component<Props> {
  renderItem(item, uppercase, color, index) {
    return (
      <PortableItem uppercase={uppercase} key={index} color={color}>
        {item.name || item.primaryName || renderFullName(item)}
      </PortableItem>
    );
  }

  renderItems(items) {
    const { uppercase, color } = this.props;
    return items.map((item, index) =>
      this.renderItem(item, uppercase, color, index)
    );
  }

  render() {
    const { items } = this.props;
    const length = items.length;

    if (length === 0) return null;

    return <React.Fragment>{this.renderItems(items)}</React.Fragment>;
  }
}

export default Items;
