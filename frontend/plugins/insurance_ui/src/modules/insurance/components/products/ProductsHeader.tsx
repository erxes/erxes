import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { IconSandbox, IconPackage, IconPlus } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface ProductsHeaderProps {
  onCreateClick: () => void;
}

export const ProductsHeader = ({ onCreateClick }: ProductsHeaderProps) => {
  const { t } = useTranslation('insurance');
  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/insurance/products">
                  <IconSandbox />
                  {t('insurance')}
                </Link>
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Button variant="ghost">
                <IconPackage />
                {t('products')}
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>
      <PageHeader.End>
        <Button onClick={onCreateClick}>
          <IconPlus size={16} />
          {t('new-product')}
        </Button>
      </PageHeader.End>
    </PageHeader>
  );
};
