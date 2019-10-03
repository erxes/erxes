import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import { SectionBody, SectionBodyItem } from 'modules/layout/styles';
import { IProduct } from 'modules/settings/productService/types';
import React from 'react';
import { IProductData } from '../types';
import ProductForm from './product/ProductForm';

type Props = {
  productsData: IProductData[];
  products: IProduct[];
  onChangeProductsData: (productsData: IProductData[]) => void;
  onChangeProducts: (prs: IProduct[]) => void;
  saveProductsData: () => void;
};

function ProductSection({
  products,
  productsData,
  onChangeProductsData,
  saveProductsData
}: Props) {
  const { Section } = Sidebar;
  const { Title, QuickButtons } = Section;

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
    if (customFieldsData) {
      Object.keys(customFieldsData).forEach(key => {
        result.push(
          <span>
            {key} {customFieldsData[key]}
          </span>
        );
      });

      return result;
    }

    return '';
  };

  return (
    <Section>
      <Title>{__('Product & Service')}</Title>

      <QuickButtons>
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
      <SectionBody>
        {products.map((product, index) => (
          <SectionBodyItem key={index}>
            <Tip text={tipItems(product)} placement="top">
              <span>{product.name}</span>
            </Tip>
          </SectionBodyItem>
        ))}
        {products.length === 0 && (
          <EmptyState icon="shopping-bag" text="No items" />
        )}
      </SectionBody>
    </Section>
  );
}

export default ProductSection;
