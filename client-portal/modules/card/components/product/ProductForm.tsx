import { Add } from "../../../styles/products";

import { __ } from "../../../../utils";
import { Config, IProduct, IProductData } from "../../../types";

import Button from "../../../common/Button";

import ProductItem from "./ProductItem";
import React from "react";
import Table from "../../../common/Table";
import EmptyState from "../../../common/form/EmptyState";
import ProductChooser from "../../containers/product/ProductChooser";
import Modal from "../../../common/Modal";
import { FooterInfo } from "../../../styles/main";

type Props = {
  onChangeProductsData: (productsData: IProductData[]) => void;
  config: Config;
  productsData: IProductData[];
};

type State = {
  totalAmount: number;
  showProductChooser: boolean;
};

class ProductForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      totalAmount: 0,
      showProductChooser: false
    };
  }

  componentDidMount() {
    this.updateTotal();
  }

  updateTotal = (productsData = this.props.productsData) => {
    let totalAmount = 0;

    productsData.forEach(p => {
      totalAmount += p.amount;
    });

    this.setState({ totalAmount });
  };

  renderTotal() {
    const { totalAmount } = this.state;
    return (
      <div>
        {totalAmount.toLocaleString()} <b>MNT</b>
      </div>
    );
  }

  removeProductItem = _id => {
    const { productsData, onChangeProductsData } = this.props;
    const removedProductsData = productsData.filter(p => p._id !== _id);

    onChangeProductsData(removedProductsData);
    this.updateTotal(removedProductsData);
  };

  duplicateProductItem = _id => {
    const { productsData, onChangeProductsData } = this.props;

    const productData: any = productsData.find(p => p._id === _id);

    productsData.push({
      ...productData,
      _id: Math.random().toString()
    });

    onChangeProductsData(productsData);

    for (const pData of productsData) {
      this.calculatePerProductAmount(pData);
    }
  };

  renderContent() {
    const { productsData } = this.props;

    if (productsData.length === 0) {
      return (
        <EmptyState size="full" text="No product or services" icon="box" />
      );
    }

    return (
      <>
        <Table>
          <thead>
            <tr>
              <th>{__("Type")}</th>
              <th>{__("Product / Service")}</th>
              <th style={{ width: "30px" }}>{__("Quantity")}</th>
              <th>{__("Unit price")}</th>
              <th>{__("Amount")}</th>
              <th>{__("")}</th>
            </tr>
          </thead>
          <tbody id="products">
            {productsData.map(productData => (
              <ProductItem
                key={productData._id}
                productData={productData}
                duplicateProductItem={this.duplicateProductItem}
                calculatePerProductAmount={this.calculatePerProductAmount}
                removeProductItem={this.removeProductItem}
                productsData={productsData}
                updateTotal={this.updateTotal}
                currentProduct={productData.product}
              />
            ))}
          </tbody>
        </Table>
        <FooterInfo>
          <table>
            <tr>
              <td>{__("Total:")}</td>
              <td>{this.renderTotal()}</td>
            </tr>
          </table>
        </FooterInfo>
      </>
    );
  }

  calculatePerProductAmount = (
    productData: IProductData,
    callUpdateTotal = true
  ) => {
    const amount = productData.unitPrice * productData.quantity;

    productData.amount = amount;

    if (callUpdateTotal) {
      this.updateTotal();
    }
  };

  addProductTrigger() {
    return (
      <Add>
        <Button
          btnStyle="primary"
          icon="plus-circle"
          onClick={() => this.setState({ showProductChooser: true })}
        >
          Add Product / Service
        </Button>
      </Add>
    );
  }

  renderBulkProductChooser() {
    const { productsData, onChangeProductsData } = this.props;

    const productOnChange = (products: IProduct[]) => {
      for (const product of products) {
        productsData.push({
          tax: 0,
          discount: 0,
          vatPercent: 0,
          amount: 0,
          maxQuantity: 0,
          product,
          quantity: 1,
          type: product.type,
          name: product.name,
          productId: product._id,
          unitPrice: product.unitPrice,
          globalUnitPrice: product.unitPrice,
          unitPricePercent: 100,
          _id: Math.random().toString()
        });
      }

      onChangeProductsData(productsData);

      for (const productData of productsData) {
        this.calculatePerProductAmount(productData);
      }
    };

    const content = props => (
      <ProductChooser
        {...this.props}
        {...props}
        selectedProducts={productsData}
        onSaveProducts={productOnChange}
      />
    );

    return (
      <Modal
        isOpen={this.state.showProductChooser}
        content={content}
        onClose={() => this.setState({ showProductChooser: false })}
      />
    );
  }

  render() {
    return (
      <>
        {this.renderBulkProductChooser()}
        {this.renderContent()}
        {this.addProductTrigger()}
      </>
    );
  }
}

export default ProductForm;
