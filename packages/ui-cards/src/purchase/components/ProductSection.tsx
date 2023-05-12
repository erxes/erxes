import { CustomField, ProductName } from '../styles';
import {
  IPurchase,
  IPaymentsData,
  IProductData,
  IExpensesData
} from '../types';

import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { IProduct } from '@erxes/ui-products/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import ProductForm from '../containers/product/ProductForm';
import { Quantity } from '../../boards/styles/stage';
import React from 'react';
import { SectionBodyItem } from '@erxes/ui/src/layout/styles';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  productsData: IProductData[];
  products: IProduct[];
  paymentsData: IPaymentsData;
  expensesData: IExpensesData[];
  onChangeProductsData: (productsData: IProductData[]) => void;
  onChangePaymentsData: (paymentsData: IPaymentsData) => void;
  onchangeExpensesData: (expensesData: IExpensesData[]) => void;
  onChangeProducts: (prs: IProduct[]) => void;
  saveProductsData: () => void;
  purchaseQuery: IPurchase;
};

function ProductSection({
  products,
  productsData,
  paymentsData,
  expensesData,
  onChangeProductsData,
  onChangePaymentsData,
  onchangeExpensesData,
  saveProductsData,
  purchaseQuery
}: Props) {
  const contentWithId = (productId?: string) => {
    const content = props => (
      <ProductForm
        {...props}
        currentProduct={productId}
        onChangeProductsData={onChangeProductsData}
        onChangePaymentsData={onChangePaymentsData}
        onchangeExpensesData={onchangeExpensesData}
        productsData={productsData}
        products={products}
        paymentsData={paymentsData}
        expensesData={expensesData}
        saveProductsData={saveProductsData}
        purchaseQuery={purchaseQuery}
      />
    );

    return content;
  };

  const tipItems = (product: IProduct) => {
    const result: React.ReactNode[] = [];

    const { customFieldsData } = product;

    Object.values(customFieldsData).forEach((field: any, index: number) => {
      result.push(
        <CustomField key={index}>
          <b>{field.text}:</b> {field.data}
        </CustomField>
      );
    });

    return result;
  };

  const renderProductFormModal = (
    trigger: React.ReactNode,
    productId?: string
  ) => {
    return (
      <ModalTrigger
        title="Manage Product & Service"
        size="xl"
        dialogClassName="wide-modal extra-wide-modal"
        trigger={trigger}
        content={contentWithId(productId)}
      />
    );
  };

  const renderProductItem = (
    productName: string,
    quantity: number,
    uom: string,
    productId: string
  ) => {
    return renderProductFormModal(
      <ProductName>
        <div>
          {productName}
          {quantity && (
            <Quantity>
              ({quantity} {uom ? uom : 'PC'})
            </Quantity>
          )}
        </div>
        <Icon icon="pen-1" />
      </ProductName>,
      productId
    );
  };

  const renderProduct = (product: IProduct) => {
    if (product.customFieldsData) {
      return (
        <Tip text={tipItems(product)} placement="bottom">
          {renderProductItem(
            product.name,
            product.quantity,
            product.uom,
            product._id
          )}
        </Tip>
      );
    }

    return renderProductItem(
      product.name,
      product.quantity,
      product.uom,
      product._id
    );
  };

  return (
    <Box
      title={__('Product & Service')}
      extraButtons={renderProductFormModal(
        <button>
          <Icon icon="edit-3" />
        </button>
      )}
      name="showProductAndService"
    >
      <div>
        {products.map((product, index) => (
          <SectionBodyItem key={index}>
            {renderProduct(product)}
          </SectionBodyItem>
        ))}
        {products.length === 0 && <EmptyState icon="list-ul" text="No items" />}
      </div>
    </Box>
  );
}

export default ProductSection;
