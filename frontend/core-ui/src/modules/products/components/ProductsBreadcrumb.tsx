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

export function ProductsBreadcrumb({
  currentPage,
}: Readonly<ProductsBreadcrumbProps>) {
  const { t } = useTranslation('common');
  const Icon = currentPage.icon;
  const helpUrl =
    'https://erxes.io/guides/68ef769c1a9ddbd30aec6c35/6992b2175cac46b2ff76b09a';

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
                <p>Manage your service or product catalog</p>
              </Tooltip.Content>
            </Tooltip>
          )}
        </Breadcrumb.List>
      </Breadcrumb>
    </PageHeader.Start>
  );
}
