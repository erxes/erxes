import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, Icon, ModalTrigger } from 'modules/common/components';
import Select from 'react-select-plus';
import {
  DealButton,
  ItemCounterContainer,
  ProductItemText
} from '../../styles';
import { selectConfigOptions } from '../../utils';
import { ProductChooser } from '../../containers';
import {
  CURRENCIES,
  MEASUREMENTS
} from 'modules/settings/generalSettings/constants';

const propTypes = {
  uom: PropTypes.array,
  currencies: PropTypes.array,
  productData: PropTypes.object.isRequired,
  removeProductItem: PropTypes.func.isRequired,
  onChangeProduct: PropTypes.func.isRequired,
  onChangeCurrency: PropTypes.func.isRequired,
  onChangeUom: PropTypes.func.isRequired,
  onChangeInput: PropTypes.func.isRequired
};

class ProductItemForm extends React.Component {
  renderProductModal(productData) {
    const { __ } = this.context;

    const productServiceTrigger = (
      <DealButton>
        {__('Product & Service')} <Icon icon="plus" />
      </DealButton>
    );

    return (
      <ModalTrigger
        title="Choose product & service"
        trigger={productServiceTrigger}
        size="large"
      >
        <ProductChooser
          save={products =>
            this.props.onChangeProduct(products, productData._id)
          }
          data={{
            name: 'Product',
            products: productData.product ? [productData.product] : []
          }}
          limit={1}
        />
      </ModalTrigger>
    );
  }

  renderProduct(productData) {
    if (!productData.product) return null;

    return (
      <ItemCounterContainer>
        <ul>
          <li>{productData.product.name}</li>
        </ul>
      </ItemCounterContainer>
    );
  }

  render() {
    const { __ } = this.context;
    const { uom, currencies } = this.props;

    const { productData } = this.props;
    return (
      <tr key={productData._id}>
        <td>
          {this.renderProductModal(productData)}
          {this.renderProduct(productData)}
        </td>
        <td>
          <Select
            name="uom"
            placeholder="Choose"
            value={productData.uom}
            onChange={value => this.props.onChangeUom(value, productData._id)}
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
            value={productData.currency}
            onChange={value =>
              this.props.onChangeCurrency(value, productData._id)
            }
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
            value={productData.quantity}
            type="number"
            min="1"
            placeholder="Quantity"
            name="quantity"
            onChange={e => this.props.onChangeInput(productData._id, e)}
          />

          <ProductItemText align="right">{__('Discount')}</ProductItemText>

          <ProductItemText align="right">{__('Tax')}</ProductItemText>
        </td>
        <td>
          <FormControl
            value={productData.unitPrice}
            placeholder="Unit price"
            name="unitPrice"
            onChange={e => this.props.onChangeInput(productData._id, e)}
          />

          <FormControl
            value={productData.discountPercent}
            type="number"
            min="0"
            max="100"
            placeholder="Discount percent"
            name="discountPercent"
            onChange={e => this.props.onChangeInput(productData._id, e)}
          />

          <FormControl
            value={productData.taxPercent}
            type="number"
            min="0"
            max="100"
            placeholder="Tax percent"
            name="taxPercent"
            onChange={e => this.props.onChangeInput(productData._id, e)}
          />

          <ProductItemText>{__('Total')}</ProductItemText>
        </td>
        <td>
          <ProductItemText>
            {(productData.quantity * productData.unitPrice).toLocaleString()}{' '}
            {productData.currency}
          </ProductItemText>

          <FormControl
            value={productData.discount}
            placeholder="Discount amount"
            name="discount"
            onChange={e => this.props.onChangeInput(productData._id, e)}
          />

          <ProductItemText>
            {productData.tax.toLocaleString()} {productData.currency}
          </ProductItemText>

          <ProductItemText>
            {productData.amount.toLocaleString()} {productData.currency}
          </ProductItemText>
        </td>
        <td>
          <div
            className="remove"
            onClick={this.props.removeProductItem.bind(this, productData._id)}
          >
            <Icon icon="ios-trash" />
          </div>
        </td>
      </tr>
    );
  }
}

ProductItemForm.propTypes = propTypes;
ProductItemForm.contextTypes = {
  __: PropTypes.func
};

export default ProductItemForm;
