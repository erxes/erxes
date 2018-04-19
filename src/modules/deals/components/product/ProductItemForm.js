import React from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  Icon,
  ModalTrigger,
  Button
} from 'modules/common/components';
import Select from 'react-select-plus';
import { ItemText } from '../../styles/product';
import { selectConfigOptions } from '../../utils';
import { ProductChooser } from '../../containers';
import { CURRENCIES, MEASUREMENTS } from 'modules/settings/general/constants';
import { Button as DealButton } from '../../styles/deal';

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
  renderProductServiceTrigger(product) {
    const { __ } = this.context;

    let content = (
      <div>
        {__('Product & Service')} <Icon icon="add" />
      </div>
    );

    // if product selected
    if (product) {
      content = (
        <div>
          {product.name} <Icon icon="edit" />
        </div>
      );
    }

    return <DealButton>{content}</DealButton>;
  }

  renderProductModal(productData) {
    return (
      <ModalTrigger
        title="Choose product & service"
        trigger={this.renderProductServiceTrigger(productData.product)}
        size="large"
      >
        <ProductChooser
          onSelect={products => {
            const product =
              products && products.length === 1 ? products[0] : null;

            this.props.onChangeProduct(product, productData._id);
          }}
          data={{
            name: 'Product',
            products: productData.product ? [productData.product] : []
          }}
          limit={1}
        />
      </ModalTrigger>
    );
  }

  render() {
    const { __ } = this.context;
    const { uom, currencies, productData } = this.props;

    return (
      <tr key={productData._id}>
        <td>{this.renderProductModal(productData)}</td>
        <td>
          <Select
            name="uom"
            placeholder={__('Choose')}
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
            placeholder={__('Choose')}
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
            defaultValue={productData.quantity}
            type="number"
            min="1"
            placeholder="0"
            name="quantity"
            onChange={e => this.props.onChangeInput(productData._id, e)}
          />

          <ItemText align="right">{__('Discount')}</ItemText>

          <ItemText align="right">{__('Tax')}</ItemText>
        </td>
        <td>
          <FormControl
            defaultValue={productData.unitPrice || ''}
            type="number"
            placeholder="0"
            name="unitPrice"
            onChange={e => this.props.onChangeInput(productData._id, e)}
          />

          <FormControl
            value={productData.discountPercent || ''}
            type="number"
            min="0"
            max="100"
            placeholder="0"
            name="discountPercent"
            onChange={e => this.props.onChangeInput(productData._id, e)}
          />

          <FormControl
            defaultValue={productData.taxPercent || ''}
            type="number"
            min="0"
            max="100"
            placeholder="0"
            name="taxPercent"
            onChange={e => this.props.onChangeInput(productData._id, e)}
          />

          <ItemText>{__('Total')}</ItemText>
        </td>
        <td>
          <ItemText>
            {(productData.quantity * productData.unitPrice).toLocaleString()}{' '}
            {productData.currency}
          </ItemText>

          <FormControl
            value={productData.discount || ''}
            type="number"
            placeholder="0"
            name="discount"
            onChange={e => this.props.onChangeInput(productData._id, e)}
          />

          <ItemText>
            {(productData.tax || 0).toLocaleString()} {productData.currency}
          </ItemText>

          <ItemText>
            {(productData.amount || 0).toLocaleString()} {productData.currency}
          </ItemText>
        </td>
        <td>
          <Button
            btnStyle="danger"
            icon="cancel-1"
            size="small"
            onClick={this.props.removeProductItem.bind(this, productData._id)}
          />
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
