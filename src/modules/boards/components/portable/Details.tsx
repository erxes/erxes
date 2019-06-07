import { ItemIndicator } from 'modules/boards/styles/stage';
import { renderFullName } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import { ICustomer } from 'modules/customers/types';
import * as React from 'react';
import { IProduct } from '../../../settings/productService/types';

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
