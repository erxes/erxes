import { IconCategory, IconCube } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator, Toggle } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { ProductCategoryAddSheet } from './AddProductCategoryForm';

export const ProductCategoriesHeader = () => {
  return (
    <PageHeader>
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
              <Toggle type="button" asChild pressed>
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
      <PageHeader.End>
        <ProductCategoryAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
