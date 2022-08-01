import { FormControl, TextInfo } from '@erxes/ui/src';
import React from 'react';

import { ICarCategory, IProduct } from '../../types';

type Props = {
  product: IProduct;
  history: any;
  isChecked: boolean;
  toggleBulk: (product: IProduct, isChecked?: boolean) => void;
  car?: ICarCategory;
  carCategories: ICarCategory[];
};

class Row extends React.Component<Props> {
  render() {
    const { product, history, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(product, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const onTdClick = () => {
      history.push(`/settings/product-service/details/${product._id}`);
    };

    const {
      code,
      name,
      type,
      category,
      supply,
      productCount,
      minimiumCount,
      unitPrice,
      sku
    } = product;

    return (
      <tr>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td onClick={onTdClick}>{code}</td>
        <td onClick={onTdClick}>{name}</td>
        <td onClick={onTdClick}>
          <TextInfo>{type}</TextInfo>
        </td>
        <td onClick={onTdClick}>{category ? category.name : ''}</td>
        <td onClick={onTdClick}>{supply || ''}</td>
        <td onClick={onTdClick}>{productCount ? productCount : 0}</td>
        <td onClick={onTdClick}>{minimiumCount ? minimiumCount : 0}</td>
        <td onClick={onTdClick}>{(unitPrice || 0).toLocaleString()}</td>
        <td onClick={onTdClick}>{sku}</td>
      </tr>
    );
  }
}

export default Row;
