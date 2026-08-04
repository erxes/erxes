import { AppsHeader } from '@/settings/apps/components/AppsHeader';
import { AppsRecordTable } from './AppsRecordTable';
import { EditApp } from './EditApp';

export const AppsSettings = () => {
  return (
    <>
      <AppsHeader />
      <AppsRecordTable />
      <EditApp />
    </>
  );
};
