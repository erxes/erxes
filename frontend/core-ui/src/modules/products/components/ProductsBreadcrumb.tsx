import { IconCube } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import type { IProductNavigationItem } from '@/products/hooks/useProductNavigationItems';

interface ProductsBreadcrumbProps {
  currentPage: IProductNavigationItem;
}

export function ProductsBreadcrumb({
  currentPage,
}: Readonly<ProductsBreadcrumbProps>) {
  const Icon = currentPage.icon;

  return (
    <PageHeader.Start>
      <Breadcrumb>
        <Breadcrumb.List className="gap-1">
          <Breadcrumb.Item>
            <Button variant="ghost" asChild>
              <Link to="/settings/products">
                <IconCube />
                Product
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
        </Breadcrumb.List>
      </Breadcrumb>
    </PageHeader.Start>
  );
}
