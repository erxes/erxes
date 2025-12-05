import React from 'react';
import { Badge, Spinner } from 'erxes-ui';
import { usePosDetail } from '../../hooks/usePosDetail';
import PosDelete from '../pos-delete/PosDelete';
import { Properties } from '../properties';
import { Slots } from '../slots';
import { Payment } from '../payment';
import { Permission } from '../permission';
import { Products } from '../products';
import { Appearance } from '../appearance';
import { ScreenConfig } from '../screenConfig';
import { EbarimtConfig } from '../ebarimtConfig';
import { FinanceConfig } from '../financeConfig';
import { DeliveryConfig } from '../deliveryConfig';
import { SyncCard } from '../syncCard';

interface MainContentProps {
  activeStep: string;
  posId?: string;
}

export interface PosComponentProps {
  posId?: string;
  posType?: string;
}

export const MainContent: React.FC<MainContentProps> = ({
  activeStep,
  posId,
}) => {
  const { posDetail, loading } = usePosDetail(posId);
  const posType = posDetail?.type;

  const renderContent = (): React.ReactNode => {
    switch (activeStep) {
      case 'properties':
        return <Properties posId={posId} posType={posType} />;
      case 'slots':
        return <Slots posId={posId} />;
      case 'payments':
        return <Payment posId={posId} posType={posType} />;
      case 'permission':
        return <Permission posId={posId} posType={posType} />;
      case 'product':
        return <Products posId={posId} posType={posType} />;
      case 'appearance':
        return <Appearance posId={posId} posType={posType} />;
      case 'screen':
        return <ScreenConfig posId={posId} posType={posType} />;
      case 'ebarimt':
        return <EbarimtConfig posId={posId} posType={posType} />;
      case 'finance':
        return <FinanceConfig posId={posId} posType={posType} />;
      case 'delivery':
        return <DeliveryConfig posId={posId} posType={posType} />;
      case 'sync':
        return <SyncCard posId={posId} posType={posType} />;

      default:
        return <Properties posId={posId} posType={posType} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden flex-col flex-1 h-full">
      <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-background shrink-0">
        <div className="flex gap-4 items-center">
          <h1 className="text-xl font-semibold text-foreground">
            {posDetail?.name || 'New POS'}
          </h1>

          <Badge variant="secondary" className="text-xs">
            {posDetail?.type || 'N/A'}
          </Badge>
        </div>

        <div className="flex gap-2 items-center">
          <PosDelete posId={posId} />
        </div>
      </div>

      {/* Content Area */}
      <div className="overflow-y-auto flex-1 mb-12">{renderContent()}</div>
    </div>
  );
};
