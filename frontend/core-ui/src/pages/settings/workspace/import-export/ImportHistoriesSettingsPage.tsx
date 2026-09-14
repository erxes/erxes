import { ImportHistories } from '@/import-export/import/components/ImportHistories';
import { ImportHistoriesFilter } from '@/import-export/import/components/ImportHistoriesFilter';
import { PageSubHeader } from 'erxes-ui';

export const ImportHistoriesSettingsPage = () => {
  return (
    <>
      <PageSubHeader>
        <ImportHistoriesFilter />
      </PageSubHeader>
      <ImportHistories />
    </>
  );
};
