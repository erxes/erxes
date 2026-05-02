import React, { useState, type ReactNode } from 'react';
import { Badge, Spinner } from 'erxes-ui';
import { IPricingPlanDetail } from '@/pricing/types';
import { GeneralInfo } from '@/pricing/edit-pricing/components/general/GeneralInfo';
import { OptionsInfo } from '@/pricing/edit-pricing/components/options/OptionsInfo';
import { RulesInfo } from '@/pricing/edit-pricing/components/rules/RulesInfo';

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
  const [saveAction, setSaveAction] = useState<ReactNode | null>(null);

  const renderContent = (): React.ReactNode => {
    switch (activeStep) {
      case 'general':
        return (
          <GeneralInfo
            pricingId={pricingId}
            pricingDetail={pricingDetail}
            onSaveActionChange={setSaveAction}
          />
        );
      case 'options':
        return (
          <OptionsInfo
            pricingId={pricingId}
            pricingDetail={pricingDetail}
            onSaveActionChange={setSaveAction}
          />
        );
      case 'rules':
      case 'common':
      case 'quantity':
      case 'price':
      case 'expiry':
        return (
          <RulesInfo
            pricingId={pricingId}
            pricingDetail={pricingDetail}
            activeStep={activeStep}
            onSaveActionChange={setSaveAction}
          />
        );
      default:
        return (
          <GeneralInfo
            pricingId={pricingId}
            pricingDetail={pricingDetail}
            onSaveActionChange={setSaveAction}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 h-full">
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
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background shrink-0">
        <div className="flex items-center flex-1 min-w-0 gap-4">
          <h1 className="max-w-[300px] text-xl font-semibold truncate text-foreground">
            {pricingDetail?.name || 'New Pricing'}
          </h1>

          <Badge variant="secondary" className="text-xs shrink-0">
            {pricingDetail?.applyType || 'N/A'}
          </Badge>
        </div>

        <div className="flex items-center gap-2 shrink-0">{saveAction}</div>
      </div>

      <div className="flex-1 mb-12 overflow-y-auto">{renderContent()}</div>
    </div>
  );
};
