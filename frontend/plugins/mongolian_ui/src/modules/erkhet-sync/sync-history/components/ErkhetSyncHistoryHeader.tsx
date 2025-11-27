import { PageHeader } from 'ui-modules';
import { ErkhetSyncHistoryBreadcrumb } from './ErkhetSyncHistoryBreadcrumb';

export const ErkhetSyncHistoryHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <ErkhetSyncHistoryBreadcrumb />
      </PageHeader.Start>
    </PageHeader>
  );
};
