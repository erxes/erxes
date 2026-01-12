import { PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';
import { CreateBrand } from './CreateBrand';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IconChessKnightFilled } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export function BrandsHeader() {
  const { t } = useTranslation('settings', {
    keyPrefix: 'brands',
  });
  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/settings/brands">
                  <IconChessKnightFilled />
                  {t('_')}
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeaderStart>
      <PageHeaderEnd>
        <CreateBrand />
      </PageHeaderEnd>
    </PageHeader>
  );
}
