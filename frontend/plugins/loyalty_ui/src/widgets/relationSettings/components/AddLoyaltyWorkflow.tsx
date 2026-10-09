import { IconLink, IconPlus } from '@tabler/icons-react';
import { Button, Label, Select, Tabs } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IRelationSettingsTriggerScope } from 'ui-modules';
import { SelectScoreCampaign } from '~/modules/loyalties/scores/components/selects/SelectScoreCampaign';
import { LoyaltyAccountTypeFormSheet } from '~/modules/loyalties/settings/account-type/components/LoyaltyAccountTypeFormSheet';
import { TierBandsFields } from '~/modules/loyalties/settings/account-type/components/TierBandsFields';
import { LoyaltyScoreCreateSheet } from '~/modules/loyalties/settings/score/components/LoyaltyScoreCreateSheet';
import { useLoyaltySourceAutomations } from '../hooks/useLoyaltySourceAutomations';
import { TierHistoryFields } from './TierHistoryFields';

type TLoyaltySourceState = ReturnType<typeof useLoyaltySourceAutomations>;

// What a new loyalty workflow for this source does, chosen one kind at a time.
export const AddLoyaltyWorkflow = ({
  scopes,
  state,
}: {
  scopes: IRelationSettingsTriggerScope[];
  state: TLoyaltySourceState;
}) => {
  const { t } = useTranslation('loyalty');
  const {
    kind,
    setKind,
    setAdding,
    scopeKey,
    setScopeKey,
    campaignId,
    setCampaignId,
    connectPoints,
    tierWallets,
    walletId,
    setWalletId,
    selectedWallet,
    tierBands,
    setTierBands,
    connectTier,
    creating,
    setCreating,
    historyOffered,
    tierHistory,
    setTierHistory,
    tierHistoryIssue,
    seeding,
  } = state;
  const canConnect =
    kind === 'points'
      ? !!campaignId
      : historyOffered &&
        !!selectedWallet &&
        !!tierBands.bands.length &&
        !tierHistoryIssue &&
        !seeding;

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4">
      <Tabs
        value={kind}
        onValueChange={(value) => setKind(value === 'tier' ? 'tier' : 'points')}
      >
        <Tabs.List>
          <Tabs.Trigger value="points">
            {t('loyalty-source-points')}
          </Tabs.Trigger>
          <Tabs.Trigger value="tier">{t('loyalty-source-tiers')}</Tabs.Trigger>
        </Tabs.List>
      </Tabs>

      <p className="text-sm text-muted-foreground">
        {kind === 'points'
          ? t('loyalty-source-hint')
          : t('loyalty-source-tiers-hint')}
      </p>

      <div className="flex flex-col gap-1">
        <Label>{t('loyalty-source-scope')}</Label>
        <Select value={scopeKey} onValueChange={setScopeKey}>
          <Select.Trigger className="w-64">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {scopes.map(({ key, label }) => (
              <Select.Item key={key} value={key}>
                {label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {kind === 'points' && (
        <div className="flex flex-col gap-1">
          <Label>{t('score-campaign')}</Label>
          <div className="flex items-center gap-2">
            <SelectScoreCampaign
              value={campaignId}
              onValueChange={setCampaignId}
              className="w-64"
              status="active"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreating('campaign')}
            >
              <IconPlus />
              {t('loyalty-new-campaign')}
            </Button>
          </div>
        </div>
      )}

      {kind === 'tier' && !historyOffered && (
        <p className="text-sm text-muted-foreground">
          {t('loyalty-source-tiers-no-history')}
        </p>
      )}

      {kind === 'tier' &&
        historyOffered &&
        (tierWallets.length ? (
          <>
            <div className="flex flex-col gap-1">
              <Label>{t('loyalty-source-wallet')}</Label>
              <div className="flex items-center gap-2">
                <Select value={walletId} onValueChange={setWalletId}>
                  <Select.Trigger className="w-64">
                    <Select.Value placeholder={t('loyalty-source-wallet')} />
                  </Select.Trigger>
                  <Select.Content>
                    {tierWallets.map(({ _id, name }) => (
                      <Select.Item key={_id} value={_id}>
                        {name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCreating('wallet')}
                >
                  <IconPlus />
                  {t('loyalty-new-wallet')}
                </Button>
              </div>
            </div>
            {selectedWallet && (
              <TierHistoryFields
                value={tierHistory}
                onChange={setTierHistory}
                issue={tierHistoryIssue}
              />
            )}
            {selectedWallet && (
              <TierBandsFields
                tiers={selectedWallet.tiers}
                value={tierBands}
                onChange={setTierBands}
              />
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {t('loyalty-source-no-tier-wallets')}
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreating('wallet')}
            >
              <IconPlus />
              {t('loyalty-new-wallet')}
            </Button>
          </div>
        ))}

      <LoyaltyScoreCreateSheet
        open={creating === 'campaign'}
        onOpenChange={(open) => setCreating(open ? 'campaign' : null)}
        onCreated={setCampaignId}
      />
      <LoyaltyAccountTypeFormSheet
        open={creating === 'wallet'}
        onOpenChange={(open) => setCreating(open ? 'wallet' : null)}
        onCreated={setWalletId}
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
          {t('cancel')}
        </Button>
        <Button
          type="button"
          disabled={!canConnect}
          onClick={kind === 'points' ? connectPoints : connectTier}
        >
          <IconLink />
          {t('loyalty-source-connect')}
        </Button>
      </div>
    </div>
  );
};
