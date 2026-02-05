import { ProductsPath } from '@/types/paths/ProductsPath';
import { IconCategory, IconCube, IconRulerMeasure } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export const ProductsNavigation = () => {
  const { t } = useTranslation('product');
  const { pathname } = useLocation();

  const currentPage = useMemo(() => {
    if (pathname.includes(ProductsPath.Categories)) {
      return {
        path: ProductsPath.Categories,
        label: t('categories'),
        icon: IconCategory,
      };
    }
    if (pathname.includes(ProductsPath.Uoms)) {
      return {
        path: ProductsPath.Uoms,
        label: 'UOM',
        icon: IconRulerMeasure,
      };
    }
    return {
      path: ProductsPath.Products,
      label: t('product-service'),
      icon: IconCube,
    };
  }, [pathname, t]);

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
};
