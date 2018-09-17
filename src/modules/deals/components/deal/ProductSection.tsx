import { EmptyState, Icon, ModalTrigger } from 'modules/common/components';
import { renderFullName } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { SectionBody, SectionBodyItem } from 'modules/layout/styles';
import * as React from 'react';
import { ProductForm } from '..';

type Props = {
  productsData: any,
  products: any,
  onChangeProductsData: any,
  onChangeProducts: any,
  saveProductsData: any
};

function ProductSection(
  {
    products,
    productsData,
    onChangeProductsData,
    onChangeProducts,
    saveProductsData
  }: Props
) {
  const { Section } = Sidebar;
  const { Title, QuickButtons } = Section;

  return (
    <Section>
      <Title>{__('Product & Service')}</Title>

      <QuickButtons>
        <ModalTrigger
          title="New Product & Service"
          dialogClassName="full"
          trigger={
            <a>
              <Icon icon="add" />
            </a>
          }
          content={(props) => (
            <ProductForm
              {...props}
              onChangeProductsData={onChangeProductsData}
              productsData={productsData}
              products={products}
              saveProductsData={saveProductsData}
            />
          )}
        />
      </QuickButtons>
      <SectionBody>
        {products.map((product, index) => (
          <SectionBodyItem key={index}>
            <span>{product.name || renderFullName(product)}</span>
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
