import { FormControl } from 'modules/common/components/form';
import Tags from 'modules/common/components/Tags';
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

    const tags = product.getTags || [];

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
      <tr onClick={onTrClick}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{code}</td>
        <td>{name}</td>
        <td>
          <TextInfo>{type}</TextInfo>
        </td>
        <td>{category ? category.name : ''}</td>
        <td>{supply || ''}</td>
        <td>{productCount ? productCount : 0}</td>
        <td>{minimiumCount ? minimiumCount : 0}</td>
        <td>{(unitPrice || 0).toLocaleString()}</td>
        <td>{sku}</td>
        <td>
          <Tags tags={tags} limit={2} />
        </td>
      </tr>
    );
  }
}

export default Row;
