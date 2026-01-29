import { ProductsPath } from '@/types/paths/ProductsPath';
import { IconCategory, IconCube, IconRulerMeasure } from '@tabler/icons-react';
import { Breadcrumb, Toggle, Button, Separator } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const ProductsNavigation = () => {
  const { t } = useTranslation('product');
  const { pathname } = useLocation();
  return (
    <PageHeader.Start>
      <Breadcrumb>
        <Breadcrumb.List className="gap-1">
          <Breadcrumb.Item>
            <Button variant="ghost" asChild>
              <Link to={ProductsPath.Products}>
                <IconCube />
                {t('product-service')}
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
              <Link to={ProductsPath.Categories}>
                <IconCategory />
                {t('categories')}
              </Link>
            </Toggle>
          </Breadcrumb.Page>
          <Breadcrumb.Separator />
          <Breadcrumb.Page>
            <Toggle type="button" asChild pressed={pathname.includes(ProductsPath.Uoms)}>
              <Link to={ProductsPath.Uoms}>
                <IconRulerMeasure />
                UOM
              </Link>
            </Toggle>
          </Breadcrumb.Page>
        </Breadcrumb.List>
      </Breadcrumb>
      <Separator.Inline />
    </PageHeader.Start>
  );
};
