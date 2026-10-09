import { IconArrowBackUp, IconCoins, IconStairs } from '@tabler/icons-react';
import { Badge, Button } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useLoyaltyTierWallets } from '../hooks/useLoyaltyTierWallets';
import { useScoreCampaignTitles } from '../hooks/useScoreCampaignTitles';
import { useStageLoyaltyPoints } from '../hooks/useStageLoyaltyPoints';
import { loyaltyRulesDialogOpenAtom } from '../states';

const WON = 'Won';

// What the saved rules make of a stage; changed only in the dialog.
export const PipelineStageLoyaltyBadge = ({
  stageId,
  probability,
}: {
  stageId: string;
  probability?: string;
}) => {
  const { t } = useTranslation('sales');
  const { earns, refunds, tier } = useStageLoyaltyPoints(stageId);
  const { titleOf } = useScoreCampaignTitles();
  const { walletName } = useLoyaltyTierWallets();
  const openRules = useSetAtom(loyaltyRulesDialogOpenAtom);

  // A Won stage that earns nothing is the case worth pointing out.
  if (!earns.length && !refunds && !tier && probability !== WON) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {earns.map(({ campaignId, ruleType }) => (
        <Badge key={campaignId} variant="success">
          <IconCoins />
          {t('loyalty-rules-badge-earns', {
            campaign: titleOf(campaignId),
            rule: t(`loyalty-rules-${ruleType}`),
          })}
        </Badge>
      ))}
      {tier && (
        <Badge variant="secondary">
          <IconStairs />
          {t('loyalty-tier-badge-sets', {
            wallet: walletName(tier.accountTypeId),
            rule: t(`loyalty-rules-${tier.ruleType}`),
          })}
        </Badge>
      )}
      {refunds && (
        <Badge variant="destructive">
          <IconArrowBackUp />
          {t('loyalty-rules-badge-refunds')}
        </Badge>
      )}
      {!earns.length && !refunds && !tier && (
        <Badge variant="secondary">{t('loyalty-rules-badge-none')}</Badge>
      )}
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto p-0 text-xs"
        onClick={() => openRules(true)}
      >
        {t('loyalty-rules-change')}
      </Button>
    </div>
  );
};
