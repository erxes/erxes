import { PricingDelete } from '@/pricing/components/PricingDelete';
import { SelectPricing } from '@/pricing/components/SelectPricing';
import { PricingEdit } from '@/pricing/edit-pricing/PricingEdit';
import { IconCoins } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';

export const PricingEditPage = () => {
  const { t } = useTranslation('loyalty');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saveAction, setSaveAction] = useState<ReactNode | null>(null);

  const handlePricingChange = (pricingId: string) => {
    navigate(`/settings/loyalty/pricing/${pricingId}`);
  };

  const handleDeleteSuccess = () => {
    navigate('/settings/loyalty/pricing');
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeaderStart>
          <Breadcrumb>
            <Breadcrumb.List className="gap-2">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/loyalty/pricing">
                    <IconCoins />
                    {t('pricing')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <SelectPricing value={id} onValueChange={handlePricingChange} />
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeaderStart>

        <PageHeaderEnd className="gap-2">
          {id && (
            <PricingDelete
              pricingIds={id}
              onDeleteSuccess={handleDeleteSuccess}
            />
          )}
          {saveAction}
        </PageHeaderEnd>
      </PageHeader>

      <PricingEdit key={id} id={id} onSaveActionChange={setSaveAction} />
    </div>
  );
};
