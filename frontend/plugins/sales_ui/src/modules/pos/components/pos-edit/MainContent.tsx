import { Appearance } from '@/pos/components/appearance';
import { PosAutomations } from '@/pos/components/automations/PosAutomations';
import { PosRelationSettings } from '@/pos/components/automations/PosRelationSettings';
import { CustomerCreate } from '@/pos/components/customerCreate/CustomerCreate';
import { DeliveryConfig } from '@/pos/components/deliveryConfig';
import { Payment } from '@/pos/components/payment';
import { Permission } from '@/pos/components/permission';
import { Products } from '@/pos/components/products';
import { Properties } from '@/pos/components/properties';
import { ScreenConfig } from '@/pos/components/screenConfig';
import { Slots } from '@/pos/components/slots';
import { SyncCard } from '@/pos/components/syncCard';
import { POS_RELATION_TAB_PREFIX } from '@/pos/constants';
import { POS_PANEL_FIELDS_CLASS_NAME } from '@/pos/constants/posPanel';
import { IPos } from '@/pos/types/pos';
import { cn, ScrollArea, Spinner } from 'erxes-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface MainContentProps {
  activeStep: string;
  posId?: string;
  posDetail?: IPos;
  loading: boolean;
  error?: Error;
  onSaveActionChange: (action: React.ReactNode | null) => void;
  saveAction?: React.ReactNode;
  compact?: boolean;
}

const FULL_HEIGHT_TABS = new Set(['slots']);

export const MainContent: React.FC<MainContentProps> = ({
  activeStep,
  posId,
  posDetail,
  loading,
  error,
  onSaveActionChange: handleSaveActionChange,
  saveAction,
  compact = false,
}) => {
  const { t } = useTranslation('sales');

  const renderContent = (): React.ReactNode => {
    if (posId && activeStep.startsWith(POS_RELATION_TAB_PREFIX)) {
      return (
        <PosRelationSettings
          moduleKey={activeStep.slice(POS_RELATION_TAB_PREFIX.length)}
          posId={posId}
          posName={posDetail?.name ?? undefined}
        />
      );
    }

    switch (activeStep) {
      case 'properties':
        return (
          <Properties
            posId={posId}
            onSaveActionChange={handleSaveActionChange}
          />
        );
      case 'slots':
        return posId ? (
          <Slots posId={posId} onSaveActionChange={handleSaveActionChange} />
        ) : null;
      case 'payments':
        return (
          <Payment posId={posId} onSaveActionChange={handleSaveActionChange} />
        );
      case 'permission':
        return (
          <Permission
            posId={posId}
            onSaveActionChange={handleSaveActionChange}
          />
        );
      case 'customer':
        return (
          <CustomerCreate
            posId={posId}
            onSaveActionChange={handleSaveActionChange}
          />
        );
      case 'automations':
        return (
          <PosAutomations
            posId={posId}
            posName={posDetail?.name ?? undefined}
          />
        );
      case 'product':
        return (
          <Products posId={posId} onSaveActionChange={handleSaveActionChange} />
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
        return <SyncCard posId={posId} />;

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

  const fullHeight = FULL_HEIGHT_TABS.has(activeStep);
  const columnClassName = cn('mx-auto w-full', {
    'max-w-3xl': !fullHeight && !compact,
    'px-6': !compact,
    'px-2': compact,
  });
  return (
    <div
      className={cn(
        '@container flex min-h-0 flex-1 flex-col',
        POS_PANEL_FIELDS_CLASS_NAME,
      )}
    >
      {fullHeight ? (
        <section
          className={cn(
            columnClassName,
            'flex min-h-0 flex-1 flex-col',
            compact ? 'py-3' : 'py-6',
          )}
        >
          <div className="min-h-0 flex-1">{renderContent()}</div>
        </section>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <section
            className={cn(
              columnClassName,
              compact ? 'pt-3 pb-6' : 'pt-6 pb-10',
            )}
          >
            {renderContent()}
          </section>
        </ScrollArea>
      )}
      {saveAction && (
        <footer className="shrink-0 border-t bg-background">
          <div
            className={cn(
              'flex items-center justify-end gap-3 py-3',
              compact ? 'px-4' : 'px-6',
            )}
          >
            {saveAction}
          </div>
        </footer>
      )}
    </div>
  );
};
