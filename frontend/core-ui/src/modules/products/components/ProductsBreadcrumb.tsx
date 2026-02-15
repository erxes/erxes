import { IconCube, IconInfoCircle } from '@tabler/icons-react';
import { Breadcrumb, Button, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import type { IProductNavigationItem } from '@/products/hooks/useProductNavigationItems';
import { ProductsPath } from '@/types/paths/ProductsPath';

interface ProductsBreadcrumbProps {
  currentPage: IProductNavigationItem;
}

const HELP_URLS: Partial<Record<ProductsPath, string>> = {
  [ProductsPath.Products]: 'https://www.youtube.com/1',
  [ProductsPath.Categories]: 'https://www.youtube.com/2',
  [ProductsPath.Uoms]: 'https://www.youtube.com/3',
  [ProductsPath.GeneralConfig]: 'https://www.youtube.com/4',
  [ProductsPath.SimilarityGroup]: 'https://www.youtube.com/5',
  [ProductsPath.BundleCondition]: 'https://www.youtube.com/6',
  [ProductsPath.BundleRule]: 'https://www.youtube.com/7',
  [ProductsPath.ProductRule]: 'https://www.youtube.com/8',
};

export function ProductsBreadcrumb({
  currentPage,
}: Readonly<ProductsBreadcrumbProps>) {
  const { t } = useTranslation('common');
  const Icon = currentPage.icon;
  const helpUrl = HELP_URLS[currentPage.path as ProductsPath];

  return (
    <PageHeader.Start>
      <Breadcrumb>
        <Breadcrumb.List className="gap-1">
          <Breadcrumb.Item>
            <Button variant="ghost" asChild>
              <Link to={ProductsPath.Products}>
                <IconCube />
                {t('Product')}
              </Link>
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Page>
            <Button variant="ghost" asChild>
              <Link to={currentPage.path}>
                <Icon />
                {currentPage.label}
              </Link>
            </Button>
          </Breadcrumb.Page>
          {helpUrl && (
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Link to={helpUrl} target="_blank" rel="noreferrer">
                  <IconInfoCircle className="size-4 text-accent-foreground" />
                </Link>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p>{t('Help')}</p>
              </Tooltip.Content>
            </Tooltip>
          )}
        </Breadcrumb.List>
      </Breadcrumb>
    </PageHeader.Start>
  );
}
