import { type Icon, IconCube } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ProductsPath } from '@/types/paths/ProductsPath';

// A record page's header: back to its list (the product list unless given),
// then the record.
export const ProductPanelBreadcrumb = ({
  title,
  to = ProductsPath.Products,
  label,
  icon: ListIcon = IconCube,
}: {
  title: ReactNode;
  to?: string;
  label?: string;
  icon?: Icon;
}) => {
  const { t } = useTranslation('product');

  return (
    <Breadcrumb className="min-w-0 pl-[var(--navigation-panel-toggle-space,0rem)]">
      <Breadcrumb.List className="min-w-0 flex-nowrap gap-1">
        <Breadcrumb.Item className="shrink-0">
          <Button variant="ghost" asChild>
            <Link to={to}>
              <ListIcon />
              {label ?? t('product', 'Product')}
            </Link>
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item className="min-w-0">
          <Breadcrumb.Page className="block max-w-64 truncate px-3 py-1 leading-5">
            {title}
          </Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
