import { ExportHistories } from '@/import-export/export/components/ExportHistories';
import { ExportHistoriesFilter } from '@/import-export/export/components/ExportHistoriesFilter';
import { PageSubHeader } from 'erxes-ui';

export const ExportHistoriesSettingsPage = () => {
  return (
    <>
      <PageSubHeader>
        <ExportHistoriesFilter />
      </PageSubHeader>
      <ExportHistories />
    </>
  );
};
