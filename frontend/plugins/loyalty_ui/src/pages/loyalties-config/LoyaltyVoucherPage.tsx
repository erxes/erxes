import { PageContainer, useQueryState } from 'erxes-ui';
import { LoyaltyLayout } from '~/modules/loyalties/settings/components/LoyaltyLayout';
import { VoucherRecordTable } from '~/modules/loyalties/settings/voucher/components/VoucherRecordTable';
import { LoyaltyVoucherEditSheet } from '~/modules/loyalties/settings/voucher/voucher-detail/components/LoyaltyVoucherEditSheet';

export const LoyaltyVoucherPage = () => {
  const [editVoucherId] = useQueryState<string>('editVoucherId');

  return (
    <LoyaltyLayout>
      <PageContainer>
        <VoucherRecordTable />
        {editVoucherId && <LoyaltyVoucherEditSheet voucherId={editVoucherId} />}
      </PageContainer>
    </LoyaltyLayout>
  );
};
