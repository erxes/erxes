import Button from 'modules/common/components/Button';
import { ControlLabel } from 'modules/common/components/form';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'erxes-ui/lib/components/form/Group';
import { generateCategoryOptions } from 'erxes-ui/lib/utils';
import React from 'react';
import { StageItemContainer } from '../../styles';
import { IProductTemplateItem } from '../../types';
import { IProduct, IProductCategory } from 'modules/settings/productService/types';
import client from 'erxes-ui/lib/apolloClient';
import gql from 'graphql-tag';
import { queries } from '../../graphql'

type Props = {
  item: IProductTemplateItem;
  productCategories?: IProductCategory[];
  type?: string;
  remove: (itemId: string) => void;
  onChange: (itemId: string, name: string, value: any) => void;
};

type State = {
  productsCombo: any[];
  products: IProduct[];
  unitPrice: number;
  quantity: number;
  discount: number;
}

class StageItem extends React.Component<Props, State> {

  constructor(props) {
    super(props);

    const item = props || {} as IProductTemplateItem;
    const { unitPrice, quantity, discount } = item;

    console.log("item on stageItem");
    console.log(item);

    this.state = {
      productsCombo: [],
      products: [],
      unitPrice: unitPrice ? unitPrice : 0,
      quantity: quantity ? quantity : 0,
      discount: discount ? discount : 0
    };

    this.getProductByCategory();
  }

  getProductByCategory = (categoryId?: string) => {

    if (!categoryId) {
      const { productCategories } = this.props;
      const defaultCategory = productCategories ? productCategories[0] : {} as IProductCategory;
      categoryId = defaultCategory._id || "";
    }

    client.query({
      query: gql(queries.products),
      fetchPolicy: 'network-only',
      variables: { categoryId }
    }).then((products) => {
      const datas = products.data.products;
      const tempArray: any[] = [{ lable: "", value: "" }];

      datas.forEach(data => {
        tempArray.push({ label: data.name, value: data._id });
      });

      this.setState({
        products: datas,
        productsCombo: tempArray,
        unitPrice: 0,
        quantity: 0,
        discount: 0
      });

    });
  }

  onUnitPrice = (_id, e) => {
    const { onChange } = this.props;

    onChange(_id, 'unitPrice', e.target.value);
  }

  onQuantity = (_id, e) => {
    const { onChange } = this.props;
    const quantity = e.target.value;

    this.setState({ quantity });
    onChange(_id, 'quantity', quantity);
  }

  onDiscount = (_id, e) => {
    const { onChange } = this.props;
    const discount = e.target.value;

    if (discount <= 100 && discount >= 0) {
      this.setState({ discount });
      onChange(_id, 'discount', discount);
    }

  }

  onItem = (_id, e) => {
    const itemId = e.target.value;
    const { onChange } = this.props;
    const { products } = this.state;
    const product = products.find(product => product._id === itemId) || {} as IProduct;
    const { unitPrice } = product;

    this.setState({
      unitPrice: unitPrice ? unitPrice : 0,
      quantity: 1,
      discount: 0
    });

    onChange(_id, 'unitPrice', unitPrice);
    onChange(_id, 'quantity', 1);
    onChange(_id, 'itemId', itemId);
  }

  onCategory = (_id, e) => {
    const categoryId = e.target.value;
    const { onChange } = this.props;

    this.getProductByCategory(categoryId);
    onChange(_id, 'categoryId', categoryId);
  }

  render() {
    const { item, remove, productCategories } = this.props;
    const { _id, categoryId, itemId } = item;
    const { unitPrice, quantity, productsCombo, discount } = this.state;

    return (
      <StageItemContainer key={_id} >
        <FormGroup>
          <ControlLabel required={true}>Category</ControlLabel>
          <FormControl
            componentClass="select"
            defaultValue={categoryId}
            onChange={this.onCategory.bind(this, _id)}
            required={true}
          >
            {generateCategoryOptions(productCategories || [])}

          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Item</ControlLabel>
          <FormControl
            value={itemId}
            onChange={this.onItem.bind(this, _id)}
            required={true}
            componentClass="select"
            options={productsCombo}
          />
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
