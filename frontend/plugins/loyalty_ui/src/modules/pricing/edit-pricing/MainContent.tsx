import React from 'react';
import { Badge, Spinner } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { IPricingPlanDetail } from '@/pricing/types';
import { GeneralInfo } from '@/pricing/edit-pricing/components/general/GeneralInfo';
import { OptionsInfo } from '@/pricing/edit-pricing/components/options/OptionsInfo';
import { PriceInfo } from '@/pricing/edit-pricing/components/price/PriceInfo';
import { QuantityInfo } from '@/pricing/edit-pricing/components/quantity/QuantityInfo';
import { RepeatInfo } from '@/pricing/edit-pricing/components/repeat/RepeatInfo';
import { ExpiryInfo } from '@/pricing/edit-pricing/components/expiry/ExpiryInfo';
import { PricingDelete } from '@/pricing/components/PricingDelete';

interface MainContentProps {
  activeStep: string;
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  loading: boolean;
  error?: Error;
}

export const PricingMainContent: React.FC<MainContentProps> = ({
  activeStep,
  pricingId,
  pricingDetail,
  loading,
  error,
}) => {
  const navigate = useNavigate();

  const handleDeleteSuccess = () => {
    navigate('/settings/pricing/');
  };
  const renderContent = (): React.ReactNode => {
    switch (activeStep) {
      case 'general':
        return (
          <GeneralInfo pricingId={pricingId} pricingDetail={pricingDetail} />
        );
      case 'options':
        return (
          <OptionsInfo pricingId={pricingId} pricingDetail={pricingDetail} />
        );
      case 'price':
        return (
          <PriceInfo pricingId={pricingId} pricingDetail={pricingDetail} />
        );
      case 'quantity':
        return (
          <QuantityInfo pricingId={pricingId} pricingDetail={pricingDetail} />
        );
      case 'repeat':
        return (
          <RepeatInfo pricingId={pricingId} pricingDetail={pricingDetail} />
        );
      case 'expiry':
        return (
          <ExpiryInfo pricingId={pricingId} pricingDetail={pricingDetail} />
        );
      default:
        return (
          <GeneralInfo pricingId={pricingId} pricingDetail={pricingDetail} />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">
          Failed to load Pricing details: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden flex-col flex-1 h-full">
      <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-background shrink-0">
        <div className="flex flex-1 gap-4 items-center min-w-0">
          <h1 className="max-w-[300px] text-xl font-semibold truncate text-foreground">
            {pricingDetail?.name || 'New Pricing'}
          </h1>

          <Badge variant="secondary" className="text-xs shrink-0">
            {pricingDetail?.applyType || 'N/A'}
          </Badge>
        </div>

        <div className="flex gap-2 items-center shrink-0">
          {pricingId && (
            <PricingDelete
              pricingIds={pricingId}
              onDeleteSuccess={handleDeleteSuccess}
            />
          )}
        </div>
      </div>

      <div className="overflow-y-auto flex-1 mb-12">{renderContent()}</div>
    </div>
  );
};
