import { IDeal, IDealParams, IPaymentsData } from "../../types";

import Alert from "@erxes/ui/src/utils/Alert";
import { IItem } from "../../../boards/types";
import { IProduct } from "@erxes/ui-products/src/types";
import ProductForm from "../../containers/product/ProductForm";
import { ProductFormContainer } from "@erxes/ui/src/styles/main";
import React from "react";

type Props = {
  item: IDeal;
  saveItem: (doc: IDealParams, callback?: (item) => void) => void;
  isFullMode?: boolean;
};

type State = {
  amount: any;
  unUsedAmount: any;
  updatedItem?: IItem;
  products: (IProduct & { quantity?: number })[];
  productsData: any;
  paymentsData: IPaymentsData;
};

export default class ProductSectionComponent extends React.Component<
  Props,
  State
> {
  constructor(props) {
    super(props);

    const item = props.item;

    this.state = {
      amount: item.amount || {},
      unUsedAmount: item.unUsedAmount || {},
      productsData: item.products ? item.products.map((p) => ({ ...p })) : [],
      products: item.products
        ? item.products.map((p) => {
            const newProduct = { ...p.product };
            newProduct.quantity = p.quantity;
            if (p.product.uom !== p.uom) {
              newProduct.subUoms = Array.from(
                new Set([
                  ...(p.product.subUoms || []),
                  { uom: p.product.uom, ratio: 1 },
                ])
              );
              newProduct.uom = p.uom;
            }
            return newProduct;
          })
        : [],

      paymentsData: item.paymentsData,
    };
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  saveProductsData = () => {
    const { productsData, paymentsData } = this.state;
    const { saveItem } = this.props;
    const products: IProduct[] = [];
    const amount: any = {};
    const unUsedAmount: any = {};
    const filteredProductsData: any = [];

    productsData.forEach((data) => {
      // products
      if (data.product) {
        if (data.currency) {
          // calculating item amount
          if (data.tickUsed) {
            if (!amount[data.currency]) {
              amount[data.currency] = data.amount || 0;
            } else {
              amount[data.currency] += data.amount || 0;
            }
          } else {
            if (!unUsedAmount[data.currency]) {
              unUsedAmount[data.currency] = data.amount || 0;
            } else {
              unUsedAmount[data.currency] += data.amount || 0;
            }
          }
        }
        // collecting data for ItemCounter component
        products.push(data.product);
        data.productId = data.product._id;
        filteredProductsData.push(data);
      }
    });

    Object.keys(paymentsData || {}).forEach((key) => {
      const perData = paymentsData[key];

      if (!perData.currency || !perData.amount || perData.amount === 0) {
        delete paymentsData[key];
      }
    });

    this.setState(
      {
        productsData: filteredProductsData,
        products,
        amount,
        unUsedAmount,
        paymentsData,
      },
      () => {
        saveItem({ productsData, paymentsData }, (updatedItem) => {
          this.setState({ updatedItem });
        });

        Alert.success("You successfully updated a product");
      }
    );
  };

  render() {
    const { products, productsData, paymentsData } = this.state;

    const pDataChange = (pData) => this.onChangeField("productsData", pData);
    const payDataChange = (payData) =>
      this.onChangeField("paymentsData", payData);

    return (
      <ProductFormContainer>
        <ProductForm
          onChangeProductsData={pDataChange}
          onChangePaymentsData={payDataChange}
          productsData={productsData}
          products={products}
          paymentsData={paymentsData}
          saveProductsData={this.saveProductsData}
          dealQuery={this.props.item}
        />
      </ProductFormContainer>
    );
  }
}
