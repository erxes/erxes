import { Button, PageContainer, ToggleGroup } from 'erxes-ui';
import {
  IconCashRegister,
  IconLayoutGrid,
  IconList,
  IconPlus,
} from '@tabler/icons-react';
import { PosCardGrid } from '@/pos/components/PosRecordList';
import { PosRecordTable } from '@/pos/components/PosRecordTable';
import { POS_CREATE_CONTENT_TYPE } from '@/pos/constants/posPanel';
import { posListViewAtom, TPosListView } from '@/pos/states/posListView';
import { SettingsHeader, useSidePanel } from 'ui-modules';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export const PosSettingsPage = () => {
  const { t } = useTranslation('sales');
  const [view, setView] = useAtom(posListViewAtom);
  const { openNewRecord } = useSidePanel();

  const onCreatePos = () => {
    openNewRecord(POS_CREATE_CONTENT_TYPE);
  };

  return (
    <PageContainer>
      <div className="flex overflow-hidden relative flex-col flex-1">
        <SettingsHeader breadcrumbs={[]}>
          <div className="flex justify-between items-center w-full">
            <Button variant="ghost">
              <IconCashRegister />
              {t('pos')}
            </Button>
            <div className="flex items-center gap-2">
              <ToggleGroup
                type="single"
                value={view}
                onValueChange={(value) => {
                  if (value) setView(value as TPosListView);
                }}
              >
                <ToggleGroup.Item value="list" aria-label={t('list')}>
                  <IconList />
                </ToggleGroup.Item>
                <ToggleGroup.Item
                  value="card"
                  aria-label={t('pos-card-view', 'Cards')}
                >
                  <IconLayoutGrid />
                </ToggleGroup.Item>
              </ToggleGroup>
              <Button onClick={onCreatePos}>
                <IconPlus className="mr-2 w-4 h-4" />
                {t('pos-create')}
              </Button>
            </div>
          </div>
        </SettingsHeader>
        <div className="flex overflow-hidden flex-auto w-full">
          <div className="flex overflow-hidden flex-col w-full">
            {view === 'list' ? (
              <PosRecordTable onCreatePos={onCreatePos} />
            ) : (
              <PosCardGrid onCreatePos={onCreatePos} />
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
