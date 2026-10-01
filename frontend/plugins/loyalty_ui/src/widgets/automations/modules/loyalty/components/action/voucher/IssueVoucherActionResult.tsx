import { useTranslation } from 'react-i18next';
import { ActionResult, AutomationExecutionActionResultProps } from 'ui-modules';
import { VoucherCampaignInline } from '~/modules/loyalties/vouchers/components/VoucherCampaignInline';
import { useIssueVoucherActionResult } from '../../../hooks/useIssueVoucherActionResult';
import { LoyaltyOwnerInline } from '../../common/LoyaltyOwnerInline';

export const IssueVoucherActionResult = ({
  action,
}: AutomationExecutionActionResultProps) => {
  const { t } = useTranslation('loyalty');
  const { vouchers } = useIssueVoucherActionResult(action);

  if (!vouchers.length) {
    return <ActionResult.Json value={action.result} />;
  }

  return (
    <ActionResult>
      <ActionResult.Status>
        {t('issue-voucher-result', { count: vouchers.length })}
      </ActionResult.Status>
      <ActionResult.Fields>
        <ActionResult.Field
          label={t('voucher-campaign')}
          value={
            <VoucherCampaignInline voucherCampaignId={vouchers[0].campaignId} />
          }
        />
        {vouchers.map(({ _id, ownerId, ownerType }) => (
          <ActionResult.Field
            key={_id}
            label={t('recipient')}
            value={<LoyaltyOwnerInline ownerId={ownerId} ownerType={ownerType} />}
          />
        ))}
      </ActionResult.Fields>
    </ActionResult>
  );
};
