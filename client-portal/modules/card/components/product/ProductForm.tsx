import { Add } from "../../../styles/products";

import { __ } from "../../../../utils";
import {
  Config,
  IPaymentsData,
  IProduct,
  IProductCategory,
  IProductData
} from "../../../types";

import Button from "../../../common/Button";

import ProductItem from "./ProductItem";
import React from "react";
import Table from "../../../common/Table";
import EmptyState from "../../../common/form/EmptyState";
import ProductChooser from "../../containers/product/ProductChooser";
import { Alert } from "../../../utils";
import Modal from "../../../common/Modal";
import { FooterInfo } from "../../../styles/main";

type Props = {
  saveProductsData?: () => void;
  onChangePaymentsData?: (paymentsData: IPaymentsData) => void;

  products: IProduct[];

  config: Config;

  categories: IProductCategory[];
};

type State = {
  totalAmount: number;

  tax: { [currency: string]: { value?: number; percent?: number } };
  discount: { [currency: string]: { value?: number; percent?: number } };
  vatPercent: number;
  changePayData: { [currency: string]: number };
  tempId: string;
  categoryId?: string;

  filterValues: any;
  showProductChooser?: boolean;
  productsData: IProductData[];
};

class ProductForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      totalAmount: 0,
      discount: {},
      tax: {},
      vatPercent: 0,
      changePayData: {},
      tempId: "",
      filterValues: JSON.parse(
        localStorage.getItem("dealProductFormFilter") || "{}"
      ),
      showProductChooser: false,
      productsData: []
    };
  }

  componentDidMount() {
    this.updateTotal();
  }

  updateTotal = (productsData = this.state.productsData) => {
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
        {totalAmount} <b>MNT</b>
      </div>
    );
  }

  onChangeProductsData = pdata => {
    this.setState({ productsData: pdata });
  };

  removeProductItem = _id => {
    const { productsData } = this.state;

    const removedProductsData = productsData.filter(p => p._id !== _id);

    this.onChangeProductsData(removedProductsData);

    this.updateTotal(removedProductsData);
  };

  duplicateProductItem = _id => {
    const { productsData } = this.state;

    const productData: any = productsData.find(p => p._id === _id);

    productsData.push({
      ...productData,
      _id: Math.random().toString()
    });

    this.onChangeProductsData(productsData);

    for (const pData of productsData) {
      this.calculatePerProductAmount("discount", pData);
    }
  };

  renderContent() {
    const { productsData } = this.state;

    if (productsData.length === 0) {
      return (
        <EmptyState size="full" text="No product or services" icon="box" />
      );
    }

    let filteredProductsData = productsData;

    const { filterValues } = this.state;

    if (filterValues.search) {
      filteredProductsData = filteredProductsData.filter(
        p =>
          p.product &&
          (p.product.name.includes(filterValues.search) ||
            p.product.code.includes(filterValues.search))
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
              <th>{__("")}</th>
              <th>{__("")}</th>
            </tr>
          </thead>
          <tbody id="products">
            {filteredProductsData.map(productData => (
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
    type: string,
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
    const { productsData } = this.state;

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

      this.onChangeProductsData(productsData);

      for (const productData of productsData) {
        this.calculatePerProductAmount("discount", productData);
      }
    };

    const content = props => (
      <ProductChooser
        {...this.props}
        {...props}
        onSaveProducts={productOnChange}
        categoryId={this.state.categoryId}
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

  onClick = () => {
    const { saveProductsData } = this.props;
    const { productsData } = this.state;

    if (productsData.length !== 0) {
      for (const data of productsData) {
        if (!data.product) {
          return Alert.error("Please choose a product");
        }

        if (!data.unitPrice && data.unitPrice !== 0) {
          return Alert.error(
            "Please enter an unit price. It should be a number"
          );
        }

        if (!data.currency) {
          return Alert.error("Please choose a currency");
        }

        if (
          data.product.type === "service" &&
          data.tickUsed &&
          !data.assignUserId
        ) {
          return Alert.error("Please choose a Assigned to any service");
        }
      }
    }

    saveProductsData();
  };

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
