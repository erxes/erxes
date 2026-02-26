import { PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';
import { CreateBrand } from './CreateBrand';
import { Breadcrumb, Button, Tooltip } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IconChessKnightFilled, IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export function BrandsHeader() {
  const { t } = useTranslation('settings', {
    keyPrefix: 'brands',
  });
  const guideUrl =
    'https://erxes.io/guides/68ef769c1a9ddbd30aec6c35/6992b1ee5cac46b2ff76b005';
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
              <Link to={guideUrl} target="_blank">
                <IconInfoCircle className="size-4 text-accent-foreground" />
              </Link>
            </Breadcrumb.Item>
            <Tooltip>
              <Tooltip.Content>
                <p>Manage multiple business identities and sub-brands</p>
              </Tooltip.Content>
            </Tooltip>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeaderStart>
      <PageHeaderEnd>
        <CreateBrand />
      </PageHeaderEnd>
    </PageHeader>
  );
}
