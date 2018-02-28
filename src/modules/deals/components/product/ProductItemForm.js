import React from 'react';
import PropTypes from 'prop-types';
import { UOM, Currencies } from '../../constants';
import { FormControl, Icon } from 'modules/common/components';
import Select from 'react-select-plus';
import { ProductItemText } from '../../styles';
import { selectOptions } from '../../utils';

const propTypes = {
  products: PropTypes.array,
  product: PropTypes.object.isRequired,
  removeProductItem: PropTypes.func.isRequired,
  onChangeSelect: PropTypes.func.isRequired,
  onChangeInput: PropTypes.func.isRequired
};

class ProductItemForm extends React.Component {
  render() {
    const { products, product } = this.props;
    const total = product.amount - product.discount - product.tax;

    return (
      <tr>
        <td>
          <Select
            placeholder="Choose"
            value={product.productId}
            onChange={value =>
              this.props.onChangeSelect(value, product._id, 'productId')
            }
            optionRenderer={option => (
              <div className="simple-option">
                <span>{option.label}</span>
              </div>
            )}
            options={selectOptions(products)}
          />
        </td>
        <td>
          <Select
            placeholder="Choose"
            value={product.uom}
            onChange={value =>
              this.props.onChangeSelect(value, product._id, 'uom')
            }
            optionRenderer={option => (
              <div className="simple-option">
                <span>{option.label}</span>
              </div>
            )}
            options={selectOptions(UOM)}
          />
        </td>
        <td>
          <Select
            placeholder="Choose"
            value={product.currency}
            onChange={value =>
              this.props.onChangeSelect(value, product._id, 'currency')
            }
            optionRenderer={option => (
              <div className="simple-option">
                <span>{option.label}</span>
              </div>
            )}
            options={selectOptions(Currencies)}
          />
        </td>
        <td>
          <FormControl
            value={product.quantity}
            type="number"
            min="1"
            placeholder="Quantity"
            onChange={this.props.onChangeInput.bind(
              this,
              product._id,
              'quantity'
            )}
          />
          <ProductItemText align="right">Discount</ProductItemText>
          <ProductItemText align="right">Tax</ProductItemText>
        </td>
        <td>
          <FormControl
            value={product.unitPrice}
            placeholder="Unit price"
            onChange={this.props.onChangeInput.bind(
              this,
              product._id,
              'unitPrice'
            )}
          />
          <FormControl
            value={product.discountPercent}
            type="number"
            min="0"
            max="100"
            placeholder="Discount percent"
            onChange={this.props.onChangeInput.bind(
              this,
              product._id,
              'discountPercent'
            )}
          />
          <FormControl
            value={product.taxPercent}
            type="number"
            min="0"
            max="100"
            placeholder="Tax"
            onChange={this.props.onChangeInput.bind(
              this,
              product._id,
              'taxPercent'
            )}
          />
          <ProductItemText>Total</ProductItemText>
        </td>
        <td>
          <ProductItemText>
            {product.amount} {product.currency}
          </ProductItemText>
          <FormControl
            value={product.discount}
            placeholder="Discount amount"
            onChange={this.props.onChangeInput.bind(
              this,
              product._id,
              'discount'
            )}
          />
          <ProductItemText>
            {product.tax} {product.currency}
          </ProductItemText>
          <ProductItemText>
            {total > 0 ? total : 0} {product.currency}
          </ProductItemText>
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
