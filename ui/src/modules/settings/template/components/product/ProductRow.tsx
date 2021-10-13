import { FormControl } from 'modules/common/components/form';
import Tags from 'modules/common/components/Tags';
import TextInfo from 'modules/common/components/TextInfo';
import React from 'react';
import { IProductTemplate } from '../../types';

type Props = {
  productTemplate: IProductTemplate;
  history: any;
  isChecked: boolean;
  toggleBulk: (productTemplate: IProductTemplate, isChecked?: boolean) => void;
};

class Row extends React.Component<Props> {
  render() {
    const { productTemplate, history, toggleBulk, isChecked } = this.props;

    const tags = productTemplate.tags || [];

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(productTemplate, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const onTrClick = () => {
      history.push(`/settings/product-service/details/${productTemplate._id}`);
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
        <td>{productTemplate.discount}</td>
        <td>{productTemplate.discount}</td>
        <td>
          <TextInfo>{productTemplate.type}</TextInfo>
        </td>
        <td>{productTemplate.discount ? productTemplate.discount : ''}</td>
        <td>{(productTemplate.discount || 0).toLocaleString()}</td>
        <td>{productTemplate.discount}</td>
        <td>
          <Tags tags={tags} limit={2} />
        </td>
      </tr>
    );
  }
}

export default Row;
