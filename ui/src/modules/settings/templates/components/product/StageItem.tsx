import FormGroup from 'erxes-ui/lib/components/form/Group';
import Button from 'modules/common/components/Button';
import { ControlLabel } from 'modules/common/components/form';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __ } from 'modules/common/utils';
import ProductChooser from 'modules/deals/containers/product/ProductChooser';
import { ContentColumn, ItemText, ProductButton } from 'modules/deals/styles';
import { IProduct } from 'modules/settings/productService/types';
import React from 'react';

import { StageItemContainer } from '../../styles';
import { IProductTemplateItem } from '../../types';

type Props = {
  item: IProductTemplateItem;
  type?: string;
  remove: (itemId: string) => void;
  onChange: (itemId: string, name: string, value: any) => void;
  products: IProduct[];
};

type State = {
  currentProduct?: IProduct;
  unitPrice: number;
  quantity: number;
  discount: number;
  categoryId: string;
  attachment: any;
};

class StageItem extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const item = props.item || ({} as IProductTemplateItem);
    const {
      unitPrice,
      quantity,
      discount,
      categoryId,
      itemId,
      attachment
    } = item;
    const { products } = props;

    this.state = {
      currentProduct: itemId
        ? products.find(product => product._id === itemId)
        : null,
      unitPrice: unitPrice ? unitPrice : 0,
      quantity: quantity ? quantity : 0,
      discount: discount ? discount : 0,
      categoryId: categoryId ? categoryId : '',
      attachment: attachment ? attachment : null
    };
  }

  onUnitPrice = (_id, e) => {
    const { onChange } = this.props;

    onChange(_id, 'unitPrice', e.target.value);
  };

  onQuantity = (_id, e) => {
    const { onChange } = this.props;
    const quantity = e.target.value;

    this.setState({ quantity });
    onChange(_id, 'quantity', quantity);
  };

  onDiscount = (_id, e) => {
    const { onChange } = this.props;
    const discount = e.target.value;

    if (discount <= 100 && discount >= 0) {
      this.setState({ discount });
      onChange(_id, 'discount', discount);
    }
  };

  renderProductServiceTrigger(product?: IProduct) {
    let content = (
      <div>
        {__('Product & service ')} <Icon icon="plus-circle" />
      </div>
    );

    // if product selected
    if (product) {
      content = (
        <div>
          {product.name} <Icon icon="pen-1" />
        </div>
      );
    }

    return <ProductButton>{content}</ProductButton>;
  }

  onChangeCategory = (categoryId: string) => {
    this.setState({ categoryId });
  };

  renderProductModal = (currentProduct?: IProduct) => {
    const productOnChange = (products: IProduct[]) => {
      const product = products && products.length === 1 ? products[0] : null;
      const itemId = product ? product._id : '';
      const { onChange } = this.props;
      const unitPrice = product ? product.unitPrice : 0;
      const { _id } = this.props.item;

      this.setState({
        currentProduct: product || undefined,
        unitPrice,
        quantity: 1,
        discount: 0,
        attachment: null
      });

      onChange(_id, 'unitPrice', unitPrice);
      onChange(_id, 'quantity', 1);
      onChange(_id, 'itemId', itemId);
      onChange(_id, 'categoryId', product ? product.categoryId : '');
      onChange(_id, 'attachment', product ? product.attachment : null);
    };

    const content = props => (
      <ProductChooser
        {...props}
        onSelect={productOnChange}
        onChangeCategory={this.onChangeCategory}
        categoryId={this.state.categoryId}
        data={{
          name: 'Product',
          products: currentProduct ? [currentProduct] : []
        }}
        limit={1}
      />
    );

    return (
      <ModalTrigger
        title="Choose product & service"
        trigger={this.renderProductServiceTrigger(currentProduct)}
        size="lg"
        content={content}
      />
    );
  };

  render() {
    const { item, remove } = this.props;
    const { _id } = item;
    const { unitPrice, quantity, discount, currentProduct } = this.state;

    return (
      <StageItemContainer key={_id}>
        <FormGroup>
          <ItemText>{__('Choose Product')}:</ItemText>

          <ContentColumn flex="3">
            {this.renderProductModal(currentProduct)}
          </ContentColumn>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Unit price</ControlLabel>
          <FormControl
            value={unitPrice}
            onChange={this.onUnitPrice.bind(this, _id)}
            type="number"
            disabled={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Quantity</ControlLabel>
          <FormControl
            value={quantity}
            onChange={this.onQuantity.bind(this, _id)}
            type="number"
            min={0}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Discount</ControlLabel>
          <FormControl
            value={discount}
            onChange={this.onDiscount.bind(this, _id)}
            type="number"
            min={0}
            max={100}
          />
        </FormGroup>
        <Button
          btnStyle="link"
          size="small"
          onClick={remove.bind(this, _id)}
          icon="times"
        />
      </StageItemContainer>
    );
  }
}

export default StageItem;
