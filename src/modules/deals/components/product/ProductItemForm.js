import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, Icon, ModalTrigger } from 'modules/common/components';
import Select from 'react-select-plus';
import { DealButton, DealProducts, ProductItemText } from '../../styles';
import { selectConfigOptions } from '../../utils';
import { ProductAssociate } from '../../containers';
import {
  CURRENCIES,
  MEASUREMENTS
} from 'modules/settings/generalSettings/constants';

const propTypes = {
  uom: PropTypes.array,
  currencies: PropTypes.array,
  product: PropTypes.object.isRequired,
  removeProductItem: PropTypes.func.isRequired,
  onChangeProduct: PropTypes.func.isRequired,
  onChangeCurrency: PropTypes.func.isRequired,
  onChangeUom: PropTypes.func.isRequired,
  onChangeInput: PropTypes.func.isRequired
};

class ProductItemForm extends React.Component {
  render() {
    const { uom, currencies } = this.props;

    const productServiceTrigger = (
      <DealButton>
        Product & Service <Icon icon="plus" />
      </DealButton>
    );

    const { product } = this.props;
    return (
      <tr key={product._id}>
        <td>
          <ModalTrigger
            title="Choose product & service"
            trigger={productServiceTrigger}
            size="large"
          >
            <ProductAssociate
              save={products =>
                this.props.onChangeProduct(products, product._id)
              }
              data={{
                name: 'Product',
                products: product.product ? [product.product] : []
              }}
              limit={1}
            />
          </ModalTrigger>
          {product.product ? (
            <DealProducts>
              <ul>
                <li>{product.product.name}</li>
              </ul>
            </DealProducts>
          ) : null}
        </td>
        <td>
          <Select
            name="uom"
            placeholder="Choose"
            value={product.uom}
            onChange={value => this.props.onChangeUom(value, product._id)}
            optionRenderer={option => (
              <div className="simple-option">
                <span>{option.label}</span>
              </div>
            )}
            options={selectConfigOptions(uom, MEASUREMENTS)}
          />
        </td>
        <td>
          <Select
            name="currency"
            placeholder="Choose"
            value={product.currency}
            onChange={value => this.props.onChangeCurrency(value, product._id)}
            optionRenderer={option => (
              <div className="simple-option">
                <span>{option.label}</span>
              </div>
            )}
            options={selectConfigOptions(currencies, CURRENCIES)}
          />
        </td>
        <td>
          <FormControl
            value={product.quantity}
            type="number"
            min="1"
            placeholder="Quantity"
            name="quantity"
            onChange={e => this.props.onChangeInput(product._id, e)}
          />
          <ProductItemText align="right">Discount</ProductItemText>
          <ProductItemText align="right">Tax</ProductItemText>
        </td>
        <td>
          <FormControl
            value={product.unitPrice}
            placeholder="Unit price"
            name="unitPrice"
            onChange={e => this.props.onChangeInput(product._id, e)}
          />
          <FormControl
            value={product.discountPercent}
            type="number"
            min="0"
            max="100"
            placeholder="Discount percent"
            name="discountPercent"
            onChange={e => this.props.onChangeInput(product._id, e)}
          />
          <FormControl
            value={product.taxPercent}
            type="number"
            min="0"
            max="100"
            placeholder="Tax percent"
            name="taxPercent"
            onChange={e => this.props.onChangeInput(product._id, e)}
          />
          <ProductItemText>Total</ProductItemText>
        </td>
        <td>
          <ProductItemText>
            {(product.quantity * product.unitPrice).toLocaleString()}{' '}
            {product.currency}
          </ProductItemText>
          <FormControl
            value={product.discount}
            placeholder="Discount amount"
            name="discount"
            onChange={e => this.props.onChangeInput(product._id, e)}
          />
          <ProductItemText>
            {product.tax.toLocaleString()} {product.currency}
          </ProductItemText>
          <ProductItemText>
            {product.amount.toLocaleString()} {product.currency}
          </ProductItemText>
        </td>
        <td>
          <div
            className="remove"
            onClick={this.props.removeProductItem.bind(this, product._id)}
          >
            <Icon icon="ios-trash" />
          </div>
        </td>
      </tr>
    );
  }
}

ProductItemForm.propTypes = propTypes;

export default ProductItemForm;
