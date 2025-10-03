import { IconCategoryPlus, IconCube } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
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
              <Button variant="ghost" asChild>
                <Link to="/products/categories">
                  <IconCategoryPlus />
                  Categories
                </Link>
              </Button>
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
