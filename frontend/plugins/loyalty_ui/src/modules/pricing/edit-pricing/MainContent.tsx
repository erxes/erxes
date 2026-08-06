import React from 'react';
import { Spinner } from 'erxes-ui';
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
}

export const PricingMainContent: React.FC<MainContentProps> = ({
  activeStep,
  pricingId,
  pricingDetail,
  loading,
  error,
}) => {
  const { t } = useTranslation('loyalty');

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
      case 'participants':
        if (pricingDetail?.priority === 'posBase') {
          return (
            <GeneralInfo pricingId={pricingId} pricingDetail={pricingDetail} />
          );
        }

        return (
          <ParticipantsInfo
            pricingId={pricingId}
            pricingDetail={pricingDetail}
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
          />
        );
      default:
        return (
          <GeneralInfo pricingId={pricingId} pricingDetail={pricingDetail} />
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
      <div className="flex-1 mb-12 overflow-y-auto">{renderContent()}</div>
    </div>
  );
};
