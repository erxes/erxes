import { PageHeader } from 'ui-modules';
import { SyncErkhetBreadcrumb } from './SyncErkhetBreadcrumb';

export const SyncErkhetTopNav = () => (
  <PageHeader>
    <PageHeader.Start>
      <SyncErkhetBreadcrumb />
    </PageHeader.Start>
  </PageHeader>
);
