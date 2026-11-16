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
import { POS_EDIT_STEP_GROUPS, POS_RELATION_TAB_PREFIX } from '@/pos/constants';
import { IPos } from '@/pos/types/pos';
import { cn, Spinner } from 'erxes-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  relationSettingsModuleKey,
  useRelationSettingsModules,
} from 'ui-modules';

interface MainContentProps {
  activeStep: string;
  posId?: string;
  posDetail?: IPos;
  loading: boolean;
  error?: Error;
  onSaveActionChange: (action: React.ReactNode | null) => void;
  saveAction?: React.ReactNode;
}

const FULL_HEIGHT_TABS = new Set(['slots']);
const WIDE_TABS = new Set(['product']);

const POS_EDIT_STEP_TITLES = new Map(
  POS_EDIT_STEP_GROUPS.flatMap((group) =>
    group.steps.map((step) => [step.value, step.title] as const),
  ),
);

export const MainContent: React.FC<MainContentProps> = ({
  activeStep,
  posId,
  posDetail,
  loading,
  error,
  onSaveActionChange: handleSaveActionChange,
  saveAction,
}) => {
  const { t } = useTranslation('sales');
  const relationModules = useRelationSettingsModules();

  const getTitle = () => {
    const stepTitle = POS_EDIT_STEP_TITLES.get(activeStep);

    if (stepTitle) {
      return t(stepTitle);
    }

    const relationModule = relationModules.find(
      (module) =>
        `${POS_RELATION_TAB_PREFIX}${relationSettingsModuleKey(module)}` ===
        activeStep,
    );

    return (
      relationModule?.label || relationModule?.name || t('general-information')
    );
  };

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
  const columnClassName = cn('mx-auto w-full px-6', {
    'max-w-6xl': !fullHeight && WIDE_TABS.has(activeStep),
    'max-w-4xl': !fullHeight && !WIDE_TABS.has(activeStep),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {fullHeight ? (
        <section
          className={cn(
            columnClassName,
            'flex min-h-0 flex-1 flex-col pt-8 pb-6',
          )}
        >
          <h2 className="mb-6 text-lg font-semibold">{getTitle()}</h2>
          <div className="min-h-0 flex-1">{renderContent()}</div>
        </section>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <section className={cn(columnClassName, 'pt-8 pb-10')}>
            <h2 className="mb-8 text-lg font-semibold">{getTitle()}</h2>
            {renderContent()}
          </section>
        </div>
      )}
      {saveAction && (
        <footer className="shrink-0 border-t bg-background">
          <div
            className={cn(
              columnClassName,
              'flex items-center justify-end gap-3 py-3',
            )}
          >
            {saveAction}
          </div>
        </footer>
      )}
    </div>
  );
};
