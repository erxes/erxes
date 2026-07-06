import { PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';
import { Breadcrumb, Button, useToast } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IconCoins, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { PricingCreateSheet } from '@/pricing/create-pricing/PricingCreateSheet';
import { useRecalculatePublicPricingDiscounts } from '@/pricing/hooks/useRecalculatePublicPricingDiscounts';

export function PricingHeader() {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const { recalculatePublicPricingDiscounts, loading } =
    useRecalculatePublicPricingDiscounts();

  const handleRecalculate = async () => {
    try {
      await recalculatePublicPricingDiscounts();
      toast({
        title: t('public-discounts-recalculated'),
        description: t('public-discounts-recalculated-desc'),
      });
    } catch {
      toast({
        title: t('failed-to-recalculate-public-discounts'),
        description: t('unexpected-error'),
        variant: 'destructive',
      });
    }
  };

  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/settings/loyalty/pricing">
                  <IconCoins />
                  {t('pricing', 'Pricing')}
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeaderStart>
      <PageHeaderEnd>
        <Button
          variant="outline"
          onClick={handleRecalculate}
          disabled={loading}
        >
          <IconRefresh />
          {loading ? t('recalculating') : t('recalc-public-plans')}
        </Button>
        <PricingCreateSheet />
      </PageHeaderEnd>
    </PageHeader>
  );
}
