import { Skeleton } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';
import { MainContent } from '@/pos/components/pos-edit/MainContent';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { posPanelTabAtom } from '@/pos/states/posPanelTab';

export const PosSettingsTitle = ({ posId }: { posId: string }) => {
  const { t } = useTranslation('sales');
  const { posDetail, loading } = usePosDetail(posId);

  if (loading && !posDetail) {
    return <Skeleton className="h-4 w-32" />;
  }

  return posDetail?.name || t('pos');
};

export const PosPanelHeaderTitle = ({ posId }: { posId: string }) => {
  const { tab } = useSidePanel();
  const setPanelTab = useSetAtom(posPanelTabAtom);

  useEffect(() => {
    setPanelTab({ posId, tab });
  }, [posId, tab, setPanelTab]);

  return <PosSettingsTitle posId={posId} />;
};

export const PosSettingsTabContent = ({
  posId,
  tab,
  compact = false,
}: {
  posId: string;
  tab: string;
  compact?: boolean;
}) => {
  const { posDetail, loading, error } = usePosDetail(posId);
  const [saveAction, setSaveAction] = useState<ReactNode | null>(null);

  return (
    <MainContent
      activeStep={tab}
      posId={posId}
      posDetail={posDetail}
      loading={loading && !posDetail}
      error={error}
      onSaveActionChange={setSaveAction}
      saveAction={saveAction}
      compact={compact}
    />
  );
};
