import { PageContainer, useQueryState } from 'erxes-ui';
import { LoyaltyLayout } from '~/modules/loyalties/settings/components/LoyaltyLayout';
import { LoyaltySpinEditSheet } from '~/modules/loyalties/settings/spin/spin-detail/components/LoyaltySpinEditSheet';
import { SpinRecordTable } from '../../modules/loyalties/settings/spin/components/SpinRecordTable';

export const LoyaltySpinPage = () => {
  const [editSpinId] = useQueryState<string>('editSpinId');

  return (
    <LoyaltyLayout>
      <PageContainer>
        <SpinRecordTable />
        {editSpinId && <LoyaltySpinEditSheet spinId={editSpinId} />}
      </PageContainer>
    </LoyaltyLayout>
  );
};
