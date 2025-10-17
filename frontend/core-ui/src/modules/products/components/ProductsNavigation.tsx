import { ProductsPath } from '@/types/paths/ProductsPath';
import { IconCategory, IconCube } from '@tabler/icons-react';
import { Breadcrumb, Toggle, Button, Separator } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { PageHeader } from 'ui-modules';

export const ProductsNavigation = () => {
  const { pathname } = useLocation();
  return (
    <PageHeader.Start>
      <Breadcrumb>
        <Breadcrumb.List className="gap-1">
          <Breadcrumb.Item>
            <Button variant="ghost" asChild>
              <Link to="/products">
                <IconCube />
                Products & Services
              </Link>
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Page>
            <Toggle
              type="button"
              asChild
              pressed={pathname.includes(ProductsPath.Categories)}
            >
              <Link to="/products/categories">
                <IconCategory />
                Categories
              </Link>
            </Toggle>
          </Breadcrumb.Page>
        </Breadcrumb.List>
      </Breadcrumb>
      <Separator.Inline />
      <PageHeader.FavoriteToggleButton />
    </PageHeader.Start>
  );
};
