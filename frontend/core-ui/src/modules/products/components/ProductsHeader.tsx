import { ProductsNavigation } from './ProductsNavigation';
import { PageHeader } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const ProductsHeader = ({ children }: React.PropsWithChildren) => {
  const { t } = useTranslation('common');
  return (
    <PageHeader>
      <ProductsNavigation />
      <PageHeader.End>
        {children}
      </PageHeader.End>
    </PageHeader>
  );
};
