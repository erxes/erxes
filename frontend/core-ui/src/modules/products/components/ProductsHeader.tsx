import { ProductsNavigation } from './ProductsNavigation';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { ProductAddSheet } from './ProductAddSheet';
import { IconSettings } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

export const ProductsHeader = () => {
  return (
    <PageHeader>
      <ProductsNavigation />
      <PageHeader.End>
        <Button variant="outline" asChild>
          <Link to="/settings/products">
            <IconSettings />
            Settings
          </Link>
        </Button>
        <ProductAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
