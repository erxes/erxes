import Box from 'modules/common/components/Box';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import { SectionBody, SectionBodyItem } from 'modules/layout/styles';
import { IProduct } from 'modules/settings/productService/types';
import React from 'react';
import { CustomField, ProductName } from '../styles';
import { IProductData } from '../types';
import ProductForm from './product/ProductForm';

type Props = {
  productsData: IProductData[];
  products: IProduct[];
  isOpen?: boolean;
  onChangeProductsData: (productsData: IProductData[]) => void;
  onChangeProducts: (prs: IProduct[]) => void;
  saveProductsData: () => void;
};

function ProductSection({
  products,
  productsData,
  onChangeProductsData,
  isOpen,
  saveProductsData
}: Props) {
  const { Section } = Sidebar;
  const { QuickButtons } = Section;

  const content = props => (
    <ProductForm
      {...props}
      onChangeProductsData={onChangeProductsData}
      productsData={productsData}
      products={products}
      saveProductsData={saveProductsData}
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

  const renderProduct = (product: IProduct) => {
    if (product.customFieldsData) {
      return (
        <Tip text={tipItems(product)} placement="bottom">
          <ProductName>{product.name}</ProductName>
        </Tip>
      );
    }

    return <ProductName>{product.name}</ProductName>;
  };
  const extraButtons = (
    <QuickButtons isSidebarOpen={isOpen}>
      <ModalTrigger
        title="New Product & Service"
        size="lg"
        trigger={
          <button>
            <Icon icon="add" />
          </button>
        }
        content={content}
      />
    </QuickButtons>
  );

  return (
    <Box
      title={__('Product & Service')}
      isOpen={false}
      extraButtons={extraButtons}
    >
      <Section>
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
      </Section>
    </Box>
  );
}

export default ProductSection;
