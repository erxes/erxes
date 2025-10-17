import { ProductsNavigation } from './ProductsNavigation';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { ProductAddSheet } from './ProductAddSheet';
export const ProductsHeader = () => {
  return (
    <PageHeader>
      <ProductsNavigation />
      <PageHeader.End>
        <ProductAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
