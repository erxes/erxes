import { FormControl } from 'modules/common/components/form';
import TextInfo from 'modules/common/components/TextInfo';
import React from 'react';
import { IProduct } from '../../types';

type Props = {
  product: IProduct;
  history: any;
  isChecked: boolean;
  toggleBulk: (product: IProduct, isChecked?: boolean) => void;
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

    const onTrClick = () => {
      history.push(`/settings/product-service/details/${product._id}`);
    };

    return (
      <tr onClick={onTrClick}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{product.name}</td>
        <td>
          <TextInfo>{product.type}</TextInfo>
        </td>
        <td>{product.description}</td>
        <td>{product.categoryName}</td>
        <td>{product.sku}</td>
      </tr>
    );
  }
}

export default Row;
