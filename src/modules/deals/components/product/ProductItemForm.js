import React from 'react';
import PropTypes from 'prop-types';
import { Products, UOM, Currencies } from '../../constants';
import { FormControl, Icon } from 'modules/common/components';
import { ProductItemText } from '../../styles';

const propTypes = {
  product: PropTypes.object.isRequired,
  removeProductItem: PropTypes.func.isRequired
};

class ProductItemForm extends React.Component {
  render() {
    const { product } = this.props;

    return (
      <tr>
        <td>
          <FormControl componentClass="select">
            {Products.map(item => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </FormControl>
        </td>
        <td>
          <FormControl componentClass="select">
            {UOM.map(item => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </FormControl>
        </td>
        <td>
          <FormControl componentClass="select">
            {Currencies.map(item => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </FormControl>
        </td>
        <td>
          <FormControl placeholder="Quantity" />
          <ProductItemText align="right">Discount</ProductItemText>
          <ProductItemText align="right">Tax</ProductItemText>
        </td>
        <td>
          <FormControl placeholder="Unit price" />
          <FormControl placeholder="Discount percent" />
          <FormControl placeholder="Tax" />
        </td>
        <td>
          <ProductItemText>5,890,000₮</ProductItemText>
          <FormControl placeholder="Discount amount" />
          <ProductItemText>120,000₮</ProductItemText>
        </td>
        <td>
          <div onClick={this.props.removeProductItem.bind(this, product._id)}>
            <Icon icon="ios-trash" />
          </div>
        </td>
      </tr>
    );
  }
}

ProductItemForm.propTypes = propTypes;

export default ProductItemForm;
