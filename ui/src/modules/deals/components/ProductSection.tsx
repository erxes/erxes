import Box from 'modules/common/components/Box';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import { SectionBody, SectionBodyItem } from 'modules/layout/styles';
import { IProduct } from 'modules/settings/productService/types';
import React from 'react';
import ProductForm from '../containers/product/ProductForm';
import { CustomField, ProductName } from '../styles';
import { IPaymentsData, IProductData } from '../types';

type Props = {
  productsData: IProductData[];
  products: IProduct[];
  paymentsData: IPaymentsData;
  onChangeProductsData: (productsData: IProductData[]) => void;
  onChangePaymentsData: (paymentsData: IPaymentsData) => void;
  onChangeProducts: (prs: IProduct[]) => void;
  saveProductsData: () => void;
  savePaymentsData: () => void;
};

function ProductSection({
  products,
  productsData,
  paymentsData,
  onChangeProductsData,
  onChangePaymentsData,
  saveProductsData,
  savePaymentsData
}: Props) {
  const content = props => (
    <ProductForm
      {...props}
      onChangeProductsData={onChangeProductsData}
      onChangePaymentsData={onChangePaymentsData}
      productsData={productsData}
      products={products}
      paymentsData={paymentsData}
      saveProductsData={saveProductsData}
      savePaymentsData={savePaymentsData}
    />
  );

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

  const renderProductFormModal = children => {
    return (
      <ModalTrigger
        title="Manage Product & Service"
        size="lg"
        dialogClassName="modal-1000w"
        trigger={children}
        content={content}
      />
    );
  }

  const renderProductName = (productName: string) => {
    return renderProductFormModal(
      <ProductName>
        {productName}
        <Icon icon="edit" />
      </ProductName>
    );
  };

  const renderProduct = (product: IProduct) => {
    if (product.customFieldsData) {
      return (
        <Tip text={tipItems(product)} placement="bottom">
          {renderProductName(product.name)}
        </Tip>
      );
    }

    return renderProductName(product.name)
  };

  return (
    <Box
      title={__('Product & Service')}
      extraButtons={renderProductFormModal(
        <button>
          <Icon icon="settings" />
        </button>
      )}
      name="showProductAndService"
    >
      <SectionBody>
        {products.map((product, index) => (
          <SectionBodyItem key={index}>
            {renderProduct(product)}
          </SectionBodyItem>
        ))}
        {products.length === 0 && (
          <EmptyState icon="shopping-bag" text="No items" />
        )}
      </SectionBody>
    </Box>
  );
}

export default ProductSection;
