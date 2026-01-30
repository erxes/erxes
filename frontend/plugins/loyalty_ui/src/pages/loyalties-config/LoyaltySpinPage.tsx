import { PageContainer } from 'erxes-ui';
import { useQueryState } from 'erxes-ui';
import { SpinRecordTable } from '../../modules/loyalties/settings/spin/components/SpinRecordTable';
import { LoyaltyLayout } from '~/modules/loyalties/settings/components/LoyaltyLayout';
import { LoyaltySpinEditSheet } from '~/modules/loyalties/settings/spin/spin-detail/components/LoyaltySpinEditSheet';
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
