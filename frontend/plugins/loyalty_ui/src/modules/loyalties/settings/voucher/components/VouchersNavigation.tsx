import { IconTicket, IconCategory } from '@tabler/icons-react';
import { Breadcrumb, Toggle, Button, Separator } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from 'ui-modules';

export const VouchersNavigation = () => {
  const { t } = useTranslation('loyalty');
  const { pathname } = useLocation();
  return (
    <PageHeader.Start>
      <Breadcrumb>
        <Breadcrumb.List className="gap-1">
          <Breadcrumb.Item>
            <Button variant="ghost" asChild name="vouchers">
              <Link to="/loyalty/vouchers">
                <IconTicket />
                {t('vouchers')}
              </Link>
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Page>
            <Toggle
              type="button"
              asChild
              pressed={pathname.includes('/categories')}
              name="categories"
            >
              <Link to="/loyalty/vouchers/categories">
                <IconCategory />
                {t('categories')}
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
