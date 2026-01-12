import { ProductsNavigation } from './ProductsNavigation';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { ProductAddSheet } from './ProductAddSheet';
import { IconSettings } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ProductsHeader = () => {
  const { t } = useTranslation('common');
  return (
    <PageHeader>
      <ProductsNavigation />
      <PageHeader.End>
        <Button variant="outline" asChild>
          <Link to="/settings/products">
            <IconSettings />
            {t('core-modules.settings')}
          </Link>
        </Button>
        <ProductAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
