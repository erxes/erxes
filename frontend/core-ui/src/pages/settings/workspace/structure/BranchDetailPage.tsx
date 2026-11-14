import { BranchEdit } from '@/settings/structure/components/branches/details/BranchEdit';
import { RecordSidePanel } from 'ui-modules';

export const BranchDetailPage = () => (
  <RecordSidePanel expanded expandedMode="page" expandable={false}>
    <BranchEdit page />
  </RecordSidePanel>
);
