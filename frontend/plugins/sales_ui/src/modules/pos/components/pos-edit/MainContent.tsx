import React, { useCallback, useState } from 'react';
import { Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IPos } from '@/pos/types/pos';
import { Properties } from '@/pos/components/properties';
import { Slots } from '@/pos/components/slots';
import { Payment } from '@/pos/components/payment';
import { Permission } from '@/pos/components/permission';
import { Products } from '@/pos/components/products';
import { Appearance } from '@/pos/components/appearance';
import { ScreenConfig } from '@/pos/components/screenConfig';
import { DeliveryConfig } from '@/pos/components/deliveryConfig';
import { SyncCard } from '@/pos/components/syncCard';

interface MainContentProps {
  activeStep: string;
  posId?: string;
  posDetail?: IPos;
  loading: boolean;
  error?: Error;
}

export interface PosComponentProps {
  posId?: string;
  posType?: string;
}

export const MainContent: React.FC<MainContentProps> = ({
  activeStep,
  posId,
  posDetail,
  loading,
  error,
}) => {
  const { t } = useTranslation('sales');
  const [headerSaveAction, setHeaderSaveAction] =
    useState<React.ReactNode | null>(null);

  const handleSaveActionChange = useCallback(
    (action: React.ReactNode | null) => {
      setHeaderSaveAction(action);
    },
    [],
  );

  const renderContent = (): React.ReactNode => {
    switch (activeStep) {
      case 'properties':
        return (
          <Properties
            posId={posId}
            onSaveActionChange={handleSaveActionChange}
          />
        );
      case 'slots':
        return posId ? <Slots posId={posId} /> : null;
      case 'payments':
        return (
          <Payment
            posId={posId}
            onSaveActionChange={handleSaveActionChange}
          />
        );
      case 'permission':
        return (
          <Permission
            posId={posId}
            onSaveActionChange={handleSaveActionChange}
          />
        );
      case 'product':
        return (
          <Products
            posId={posId}
            onSaveActionChange={handleSaveActionChange}
          />
        );
      case 'appearance':
        return (
          <Appearance
            posId={posId}
            onSaveActionChange={handleSaveActionChange}
          />
        );
      case 'screen':
        return (
          <ScreenConfig
            posId={posId}
            onSaveActionChange={handleSaveActionChange}
          />
        );
      case 'delivery':
        return (
          <DeliveryConfig
            posId={posId}
            onSaveActionChange={handleSaveActionChange}
          />
        );
      case 'sync':
        return (
          <SyncCard
            posId={posId}
            onSaveActionChange={handleSaveActionChange}
          />
        );

      default:
        return (
          <Properties
            posId={posId}
            onSaveActionChange={handleSaveActionChange}
          />
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
          {t('failed-to-load-pos-details', { message: error.message })}
        </p>
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden flex-col flex-1 h-full min-h-0">
      <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-background shrink-0">
        <div className="flex flex-1 gap-4 items-center min-w-0">
          <h1 className="max-w-[100px] text-xl font-semibold truncate text-foreground">
            {posDetail?.name || t('new-pos')}
          </h1>
        </div>

        <div className="flex gap-2 items-center shrink-0">
          {headerSaveAction}
        </div>
      </div>

      {/* Content Area */}
      <div className="overflow-y-auto flex-1 min-h-0">{renderContent()}</div>
    </div>
  );
};
