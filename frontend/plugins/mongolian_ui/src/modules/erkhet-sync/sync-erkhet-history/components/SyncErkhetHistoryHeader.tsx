import { PageHeader } from 'ui-modules';
import { SyncErkhetHistoryBreadcrumb } from './SyncErkhetHistoryBreadcrumb';

export const SyncErkhetHistoryHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <SyncErkhetHistoryBreadcrumb />
      </PageHeader.Start>
    </PageHeader>
  );
};
