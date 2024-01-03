import { FormControl } from '@erxes/ui/src/components/form';
import Icon from '@erxes/ui/src/components/Icon';
import Tags from '@erxes/ui/src/components/Tags';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import React from 'react';
import { IProduct } from '../../types';
import { __ } from '@erxes/ui/src/utils/core';
import ProductForm from '@erxes/ui-products/src/containers/ProductForm';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';

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

    const content = props => <ProductForm {...props} product={product} />;

    const { code, name, type, category, unitPrice } = product;

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
        <td>{(unitPrice || 0).toLocaleString()}</td>
        <td>
          <Tags tags={tags} limit={2} />
        </td>
        <td onClick={onClick}>
          <ModalTrigger
            title="Edit basic info"
            trigger={<Icon icon="edit" />}
            size="xl"
            content={content}
          />
        </td>
      </tr>
    );
  }
}

export default Row;
