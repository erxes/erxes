import React, { type ReactNode } from 'react';
import { Badge, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IPricingPlanDetail } from '@/pricing/types';
import { GeneralInfo } from '@/pricing/edit-pricing/components/general/GeneralInfo';
import { OptionsInfo } from '@/pricing/edit-pricing/components/options/OptionsInfo';
import { ParticipantsInfo } from '@/pricing/edit-pricing/components/participants/ParticipantsInfo';
import { RulesInfo } from '@/pricing/edit-pricing/components/rules/RulesInfo';

interface MainContentProps {
  activeStep: string;
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  loading: boolean;
  error?: Error;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

export const PricingMainContent: React.FC<MainContentProps> = ({
  activeStep,
  pricingId,
  pricingDetail,
  loading,
  error,
  onSaveActionChange,
}) => {
  const { t } = useTranslation('loyalty');

  const renderContent = (): React.ReactNode => {
    switch (activeStep) {
      case 'general':
        return (
          <GeneralInfo
            pricingId={pricingId}
            pricingDetail={pricingDetail}
            onSaveActionChange={onSaveActionChange}
          />
        );
      case 'options':
        return (
          <OptionsInfo
            pricingId={pricingId}
            pricingDetail={pricingDetail}
            onSaveActionChange={onSaveActionChange}
          />
        );
      case 'participants':
        if (pricingDetail?.priority === 'posBase') {
          return (
            <GeneralInfo
              pricingId={pricingId}
              pricingDetail={pricingDetail}
              onSaveActionChange={onSaveActionChange}
            />
          );
        }

        return (
          <ParticipantsInfo
            pricingId={pricingId}
            pricingDetail={pricingDetail}
            onSaveActionChange={onSaveActionChange}
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
            onSaveActionChange={onSaveActionChange}
          />
        );
      default:
        return (
          <GeneralInfo
            pricingId={pricingId}
            pricingDetail={pricingDetail}
            onSaveActionChange={onSaveActionChange}
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
          {t('failed-to-load-pricing-details', { message: error.message })}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <div className="flex items-center px-6 py-4 border-b border-border bg-background shrink-0">
        <div className="flex w-fit max-w-full min-w-0 items-center gap-4">
          <h1 className="min-w-0 whitespace-normal break-words text-xl font-semibold leading-7 text-foreground">
            {pricingDetail?.name || t('new-pricing')}
          </h1>

          <Badge variant="secondary" className="text-xs shrink-0">
            {pricingDetail?.applyType || t('na')}
          </Badge>
        </div>
      </div>

      <div className="flex-1 mb-12 overflow-y-auto">{renderContent()}</div>
    </div>
  );
};
