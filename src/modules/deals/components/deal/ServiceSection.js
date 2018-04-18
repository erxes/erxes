import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { ModalTrigger, Icon, EmptyState } from 'modules/common/components';
import { renderFullName } from 'modules/common/utils';
import { SectionBody, SectionBodyItem } from 'modules/customers/styles';
import { ProductForm } from '../';

const propTypes = {
  productsData: PropTypes.array,
  products: PropTypes.array,
  onChangeProductsData: PropTypes.func,
  onChangeProducts: PropTypes.func,
  saveProductsData: PropTypes.func
};

const defaultProps = {
  products: []
};

function ServiceSection(
  {
    products,
    productsData,
    onChangeProductsData,
    onChangeProducts,
    saveProductsData
  },
  { __ }
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
        >
          <ProductForm
            onChangeProductsData={onChangeProductsData}
            onChangeProducts={onChangeProducts}
            productsData={productsData}
            products={products}
            saveProductsData={saveProductsData}
          />
        </ModalTrigger>
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

ServiceSection.propTypes = propTypes;
ServiceSection.contextTypes = {
  __: PropTypes.func
};
ServiceSection.defaultProps = defaultProps;

export default ServiceSection;
