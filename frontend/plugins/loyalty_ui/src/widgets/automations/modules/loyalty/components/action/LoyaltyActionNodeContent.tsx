import { AutomationActionNodeConfigProps } from 'ui-modules';
import {
  IconMinus,
  IconPlus,
  IconReceipt,
  IconTicket,
} from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SCORE_ACTION_LABELS } from '../../constants/adjustScoreAction';
import { TAdjustScoreActionConfigForm } from '../../states/adjustScoreActionConfigFormDefinitions';
import {
  TAwardSpinActionConfigForm,
  TIssueVoucherActionConfigForm,
} from '../../states/campaignActionConfigFormDefinitions';
import {
  isAdjustScoreActionType,
  isAwardSpinActionType,
  isIssueVoucherActionType,
} from '../../utils/loyaltyActionUtils';

type TLoyaltyActionNodeConfig =
  | TAdjustScoreActionConfigForm
  | TIssueVoucherActionConfigForm
  | TAwardSpinActionConfigForm;

export const LoyaltyActionNodeContent = ({
  actionData,
  config,
}: AutomationActionNodeConfigProps<TLoyaltyActionNodeConfig>) => {
  const { t } = useTranslation('loyalty');

  if (isIssueVoucherActionType(actionData?.type)) {
    const voucherCampaignId =
      config && 'voucherCampaignId' in config
        ? config.voucherCampaignId
        : undefined;

    return (
      <div className="flex items-center gap-2 text-sm text-accent-foreground">
        <span className="flex size-5 items-center justify-center rounded bg-muted text-foreground">
          <IconReceipt className="size-3.5" />
        </span>
        <span>
          {t('issue-voucher-using', 'Issue voucher using')}{' '}
          {voucherCampaignId ? t('voucher-campaign', 'Voucher Campaign') : t('no-campaign-selected', 'No campaign selected')}
        </span>
      </div>
    );
  }

  if (isAwardSpinActionType(actionData?.type)) {
    const spinCampaignId =
      config && 'spinCampaignId' in config ? config.spinCampaignId : undefined;

    return (
      <div className="flex items-center gap-2 text-sm text-accent-foreground">
        <span className="flex size-5 items-center justify-center rounded bg-muted text-foreground">
          <IconTicket className="size-3.5" />
        </span>
        <span>
          {t('award-spin-using', 'Award spin using')}{' '}
          {spinCampaignId ? t('spin-campaign', 'Spin Campaign') : t('no-campaign-selected', 'No campaign selected')}
        </span>
      </div>
    );
  }

  if (!isAdjustScoreActionType(actionData?.type)) {
    return null;
  }

  const action = config && 'action' in config ? config.action || 'add' : 'add';
  const campaignId =
    config && 'campaignId' in config ? config.campaignId : undefined;
  const Icon = action === 'subtract' ? IconMinus : IconPlus;

  return (
    <div className="flex items-center gap-2 text-sm text-accent-foreground">
      <span
        className={cn(
          'flex size-5 items-center justify-center rounded bg-muted text-foreground',
          action === 'add' && 'text-success',
          action === 'subtract' && 'text-destructive',
        )}
      >
        <Icon className="size-3.5" />
      </span>
      <span>
        {SCORE_ACTION_LABELS[action]} {t('using', 'using')}{' '}
        {campaignId ? t('score-campaign', 'Score Campaign') : t('no-campaign-selected', 'No campaign selected')}
      </span>
    </div>
  );
};
