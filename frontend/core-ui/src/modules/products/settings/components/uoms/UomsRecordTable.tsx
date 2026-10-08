import { useTranslation } from 'react-i18next';
import { RecordTable } from 'erxes-ui';
import { useUoms } from '../../hooks/useUoms';
import { uomsColumns } from './UomsColumns';
import { IconRulerMeasure } from '@tabler/icons-react';
import { UomsCommandBar } from './UomsCommandBar';
import { AddUomSheet } from './AddUomSheet';

export const UomsRecordTable = () => {
  const { uoms, loading } = useUoms();
  const { t } = useTranslation('product', { keyPrefix: 'uoms' });

  if (!loading && (uoms?.length ?? 0) === 0) {
    return <EmptyStateRow />;
  }

  return (
    <RecordTable.Provider
      columns={uomsColumns(t)}
      data={uoms || []}
      className="h-full"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={10} />}
            {!loading && <RecordTable.RowList />}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <UomsCommandBar />
    </RecordTable.Provider>
  );
};

function EmptyStateRow() {
  const { t } = useTranslation('product', { keyPrefix: 'uoms' });
  return (
    <div className="flex flex-col gap-2 justify-center items-center p-6 w-full h-full text-center">
      <IconRulerMeasure
        size={64}
        stroke={1.5}
        className="text-muted-foreground"
      />
      <h2 className="text-lg font-semibold text-muted-foreground">
        {t('empty-title')}
      </h2>
      <p className="mb-4 text-md text-muted-foreground">{t('empty-hint')}</p>
      <AddUomSheet />
    </div>
  );
}
