import {
  Button,
  FormControl,
  Icon,
  ModalTrigger
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { CURRENCIES, MEASUREMENTS } from 'modules/settings/general/constants';
import * as React from 'react';
import Select from 'react-select-plus';
import { ProductChooser } from '../../containers';
import { Button as DealButton } from '../../styles/deal';
import { ItemText } from '../../styles/product';
import { IProductData } from '../../types';
import { selectConfigOptions } from '../../utils';

type Props = {
  uom: string[];
  currencies: string[];
  productsData?: IProductData[];
  productData: IProductData;
  removeProductItem?: (productId: string) => void;
  onChangeProductsData?: (productsData: IProductData[]) => void;
  updateTotal?: () => void;
};

class ProductItemForm extends React.Component<Props> {
  constructor(props) {
    super(props);

    this.onChangeField = this.onChangeField.bind(this);
    this.calculateAmount = this.calculateAmount.bind(this);
  }

  calculateAmount(type, productData) {
    const amount = productData.unitPrice * productData.quantity;

    if (amount > 0) {
      switch (type) {
        case 'discount': {
          productData.discountPercent = (productData.discount * 100) / amount;
          break;
        }
        case 'discountPercent': {
          productData.discount = (amount * productData.discountPercent) / 100;
          break;
        }
        default: {
          productData.discountPercent = (productData.discount * 100) / amount;
          productData.discount = (amount * productData.discountPercent) / 100;
        }
      }

      productData.tax =
        ((amount - productData.discount || 0) * productData.taxPercent) / 100;
      productData.amount =
        amount - (productData.discount || 0) + (productData.tax || 0);
    } else {
      productData.tax = 0;
      productData.taxPercent = 0;
      productData.discount = 0;
      productData.discountPercent = 0;
      productData.amount = 0;
    }

    const { updateTotal } = this.props;

    if (updateTotal) {
      updateTotal();
    }
  }

  onChangeField(type, value, productId) {
    const { productsData, onChangeProductsData } = this.props;

    if (productsData) {
      const productData = productsData.find(p => p._id === productId);
      if (productData) {
        productData[type] = value;
      }

      if (type !== 'product' && type !== 'uom') {
        this.calculateAmount(type, productData);
      }

      if (onChangeProductsData) {
        onChangeProductsData(productsData);
      }
    }
  }

  renderProductServiceTrigger(product) {
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
        content={props => (
          <ProductChooser
            {...props}
            onSelect={products => {
              const product =
                products && products.length === 1 ? products[0] : null;

              this.onChangeField('product', product, productData._id);
            }}
            data={{
              name: 'Product',
              products: productData.product ? [productData.product] : []
            }}
            limit={1}
          />
        )}
      />
    );
  }

  render() {
    const { uom, currencies, productData, removeProductItem } = this.props;

    return (
      <tr key={productData._id}>
        <td>{this.renderProductModal(productData)}</td>
        <td>
          <Select
            name="uom"
            placeholder={__('Choose')}
            value={productData.uom}
            onChange={option =>
              this.onChangeField(
                'uom',
                option ? option.value : '',
                productData._id
              )
            }
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
            onChange={currency =>
              this.onChangeField(
                'currency',
                currency ? currency.value : '',
                productData._id
              )
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
            min={1}
            placeholder="0"
            name="quantity"
            onChange={e =>
              this.onChangeField(
                (e.target as HTMLInputElement).name,
                (e.target as HTMLInputElement).value,
                productData._id
              )
            }
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
            onChange={e =>
              this.onChangeField(
                (e.target as HTMLInputElement).name,
                (e.target as HTMLInputElement).value,
                productData._id
              )
            }
          />

          <FormControl
            value={productData.discountPercent || ''}
            type="number"
            min={0}
            max={100}
            placeholder="0"
            name="discountPercent"
            onChange={e =>
              this.onChangeField(
                (e.target as HTMLInputElement).name,
                (e.target as HTMLInputElement).value,
                productData._id
              )
            }
          />

          <FormControl
            defaultValue={productData.taxPercent || ''}
            type="number"
            min={0}
            max={100}
            placeholder="0"
            name="taxPercent"
            onChange={e =>
              this.onChangeField(
                (e.target as HTMLInputElement).name,
                (e.target as HTMLInputElement).value,
                productData._id
              )
            }
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
            onChange={e =>
              this.onChangeField(
                (e.target as HTMLInputElement).name,
                (e.target as HTMLInputElement).value,
                productData._id
              )
            }
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
            onClick={() =>
              removeProductItem && removeProductItem(productData._id)
            }
          />
        </td>
      </tr>
    );
  }
}

export default ProductItemForm;
