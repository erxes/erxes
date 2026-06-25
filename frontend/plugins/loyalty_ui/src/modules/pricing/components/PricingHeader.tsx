import { PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IconCoins } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { PricingCreateSheet } from '@/pricing/create-pricing/PricingCreateSheet';

export function PricingHeader() {
  const { t } = useTranslation('loyalty');
  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/settings/loyalty/pricing">
                  <IconCoins />
                  {t('pricing')}
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeaderStart>
      <PageHeaderEnd>
        <PricingCreateSheet />
      </PageHeaderEnd>
    </PageHeader>
  );
}
