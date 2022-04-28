import {
  __,
  FormControl,
  TextInfo,
  Button,
  Tip,
  Icon,
  ModalTrigger
} from 'erxes-ui';
import React from 'react';
import { ICarCategory, IProduct } from '../../types';
import MatchForm from '../../containers/MatchCarForm';

type Props = {
  product: IProduct;
  history: any;
  isChecked: boolean;
  toggleBulk: (product: IProduct, isChecked?: boolean) => void;
  car?: ICarCategory;
  carCategories: ICarCategory[];
};

class Row extends React.Component<Props> {
  manageAction = () => {
    const { carCategories, product } = this.props;
    const trigger = (
      <Button id="skill-edit-skill" btnStyle="link">
        <Tip text={__('Match')} placement="bottom">
          <Icon icon="car" />
        </Tip>
      </Button>
    );

    const content = props => (
      <MatchForm {...props} carCategories={carCategories} product={product} />
    );

    return (
      <ModalTrigger
        title="Add Car Category"
        trigger={trigger}
        autoOpenKey="showKBAddMatchModal"
        content={content}
      />
    );
  };
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
        <td>{this.manageAction()}</td>
      </tr>
    );
  }
}

export default Row;
