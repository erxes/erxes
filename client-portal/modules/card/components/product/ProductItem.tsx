import React from "react";
import FormControl from "../../../common/form/Control";
import Icon from "../../../common/Icon";
import { __ } from "../../../../utils";
import { TypeBox } from "../../../styles/products";
import { IProductData, IProduct } from "../../../types";
import Tip from "../../../common/Tip";

type Props = {
  productsData?: IProductData[];
  productData: IProductData;
  removeProductItem?: (productId: string) => void;
  onChangeProductsData?: (productsData: IProductData[]) => void;
  duplicateProductItem?: (productId: string) => void;
  calculatePerProductAmount: (productData: IProductData) => void;
  updateTotal?: () => void;
  currentProduct?: IProduct;
};

type State = {
  categoryId: string;
  currentProduct: string;
  currentDiscountVoucher: any;
  isSelectedVoucher: boolean;
};

class ProductItem extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      categoryId: "",
      currentProduct: props.currentProduct,
      currentDiscountVoucher: null,
      isSelectedVoucher: false
    };
  }

  renderType = (product: any) => {
    const { type = "" } = product;

    if (!type) {
      return (
        <Tip text={__("Unknown")} placement="left">
          <TypeBox color="#AAAEB3">
            <Icon icon="folder-2" />
          </TypeBox>
        </Tip>
      );
    }

    if (type.includes("product")) {
      return (
        <>
          <Tip text={__("Product")} placement="left">
            <TypeBox color="#3B85F4">
              <Icon icon="box" />
            </TypeBox>
          </Tip>
        </>
      );
    }

    return (
      <>
        <Tip text={__("Service")} placement="left">
          <TypeBox color="#EA475D">
            <Icon icon="invoice" />
          </TypeBox>
        </Tip>
      </>
    );
  };

  onClick = () => {
    const { productData, removeProductItem } = this.props;

    return removeProductItem && removeProductItem(productData._id);
  };

  onChange = e =>
    this.onChangeField(
      (e.target as HTMLInputElement).name,
      (e.target as HTMLInputElement).value,
      this.props.productData._id
    );

  onChangeField = (type: string, value, _id: string) => {
    const {
      productsData,
      onChangeProductsData,
      calculatePerProductAmount
    } = this.props;

    if (productsData) {
      const productData = productsData.find(p => p._id === _id);

      if (productData) {
        productData[type] = value;
      }

      if (type !== "uom" && productData) {
        calculatePerProductAmount(productData);
      }

      if (onChangeProductsData) {
        onChangeProductsData(productsData);
      }
    }
  };

  render() {
    const { removeProductItem, productData } = this.props;

    return (
      <tr key={productData._id}>
        <td>{this.renderType(productData)}</td>
        <td>{productData.name}</td>
        <td>
          <FormControl
            defaultValue={productData.quantity || 0}
            type="number"
            min={1}
            max={
              productData?.maxQuantity > 0
                ? productData?.maxQuantity
                : undefined
            }
            placeholder="0"
            name="quantity"
            onChange={this.onChange}
          />
        </td>
        <td>
          <FormControl
            value={productData.unitPrice || ""}
            type="number"
            placeholder="0"
            name="unitPrice"
            onChange={this.onChange}
          />
        </td>
        <td>{productData.amount.toLocaleString()}</td>

        <td>
          <Tip text="remove" placement="right">
            <Icon
              onClick={removeProductItem?.bind(this, productData._id)}
              icon="times-circle"
            />
          </Tip>
        </td>
        <td>
          <Tip text="copy" placement="right">
            <Icon
              onClick={this.props.duplicateProductItem?.bind(
                this,
                productData._id
              )}
              icon="copy-alt"
            />
          </Tip>
        </td>
      </tr>
    );
  }
}

export default ProductItem;
