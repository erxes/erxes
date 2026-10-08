import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  automationReturnLinkSearch,
  buildAutomationSeedLink,
  generateAutomationElementId,
  IRelationSettingsTriggerScope,
  IRelationSettingsWidgetContext,
  TAutomationSeedAction,
} from 'ui-modules';
import { useLoyaltyAccountTypes } from '~/modules/loyalties/settings/account-type/hooks/useLoyaltyAccountTypes';
import { activeTiers } from '~/modules/loyalties/settings/account-type/types';
import {
  EMPTY_TIER_BANDS,
  TTierBandsValue,
} from '~/modules/loyalties/settings/account-type/tierBands';
import {
  ADJUST_SCORE_ACTION_TYPE,
  SET_TIER_ACTION_TYPE,
} from '~/modules/loyalties/settings/score/add-score-campaign/constants/campaignAutomations';
import { SCORE_CAMPAIGNS_SIMPLE_QUERY } from '~/modules/loyalties/scores/graphql/queries';
import { LOYALTY_SOURCE_AUTOMATIONS } from '../graphql/loyaltySourceAutomationsQuery';

type TNode = { type: string; config?: Record<string, unknown> };

type TAutomationRecord = {
  _id: string;
  name?: string;
  status?: string;
  triggers?: TNode[];
  actions?: TNode[];
};

export type TLoyaltySourceConnection = {
  _id: string;
  name: string;
  status?: string;
  scopeLabel: string;
  // What it feeds: the campaigns given points, or the wallets whose tier is set.
  target: string;
  // A step left without its campaign or wallet does nothing.
  incomplete: boolean;
};

const valueOf = (config: Record<string, unknown> | undefined, key: string) =>
  String(config?.[key] ?? '');

/**
 * What this source's purchases do in loyalty — points given, tiers set — and
 * the links that start a new one. The source is known only by the trigger it
 * hands over: a trigger belongs to the scope whose every key it shares.
 */
export const useLoyaltySourceAutomations = ({
  triggerType,
  scopes = [],
  buyerAttribution,
  label,
  returnTo,
}: IRelationSettingsWidgetContext) => {
  const navigate = useNavigate();
  const [scopeKey, setScopeKey] = useState(scopes[0]?.key || '');
  const [campaignId, setCampaignId] = useState('');
  const [walletId, setWalletId] = useState('');
  // The add panel stays folded until asked for; it offers one kind at a time.
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<'points' | 'tier'>('points');
  // Making what is missing without leaving: a campaign, or a wallet.
  const [creating, setCreating] = useState<'campaign' | 'wallet' | null>(null);
  const [tierBands, setTierBands] = useState<TTierBandsValue>(EMPTY_TIER_BANDS);

  const { data, loading, error } = useQuery<{
    automations: TAutomationRecord[];
  }>(LOYALTY_SOURCE_AUTOMATIONS, {
    variables: {
      triggerTypes: [triggerType],
      actionTypes: [ADJUST_SCORE_ACTION_TYPE, SET_TIER_ACTION_TYPE],
    },
    skip: !triggerType,
    // Automations are edited elsewhere; coming back must show the change.
    fetchPolicy: 'cache-and-network',
  });

  const { data: campaignsData } = useQuery<{
    scoreCampaigns?: { list?: { _id: string; title: string }[] };
  }>(SCORE_CAMPAIGNS_SIMPLE_QUERY, {
    variables: { limit: 100 },
    skip: !triggerType,
  });
  const { accounts } = useLoyaltyAccountTypes(
    { status: 'active' },
    !triggerType,
  );
  // Only a wallet with tiers can have one set.
  const tierWallets = accounts.filter(({ tiers }) => activeTiers(tiers).length);

  const campaignTitle = (id: unknown) =>
    campaignsData?.scoreCampaigns?.list?.find(({ _id }) => _id === id)?.title ||
    '';
  const walletName = (id: unknown) =>
    accounts.find(({ _id }) => _id === id)?.name || '';

  const keys = [
    ...new Set(
      scopes.flatMap(({ triggerConfig }) => Object.keys(triggerConfig)),
    ),
  ];
  const scopeOf = (config?: Record<string, unknown>) =>
    scopes.find(({ triggerConfig }) =>
      keys.every((key) => valueOf(config, key) === valueOf(triggerConfig, key)),
    );

  const connectionsOf = (
    actionType: string,
    targetKey: 'campaignId' | 'accountTypeId',
    nameOf: (id: unknown) => string,
  ): TLoyaltySourceConnection[] =>
    (data?.automations || []).flatMap(
      ({ _id, name, status, triggers, actions }) => {
        const scope = (triggers || [])
          .filter(({ type }) => type === triggerType)
          .map(({ config }) => scopeOf(config))
          .find((found): found is IRelationSettingsTriggerScope => !!found);
        const steps = (actions || []).filter(({ type }) => type === actionType);

        if (!scope || !steps.length) {
          return [];
        }

        return [
          {
            _id,
            name: name || '',
            status,
            scopeLabel: scope.label,
            target: [
              ...new Set(
                steps.map(({ config }) => nameOf(config?.[targetKey])),
              ),
            ]
              .filter(Boolean)
              .join(', '),
            incomplete: steps.some(({ config }) => !config?.[targetKey]),
          },
        ];
      },
    );

  const pointConnections = connectionsOf(
    ADJUST_SCORE_ACTION_TYPE,
    'campaignId',
    campaignTitle,
  );
  const tierConnections = connectionsOf(
    SET_TIER_ACTION_TYPE,
    'accountTypeId',
    walletName,
  );

  const editPath = (automationId: string) =>
    `/automations/edit/${automationId}${automationReturnLinkSearch(returnTo)}`;

  // The builder opens filled in; saving it is the connection.
  const openSeed = (name: string, actions: TAutomationSeedAction[]) => {
    const scope = scopes.find(({ key }) => key === scopeKey);

    if (!triggerType || !scope || !actions.length) {
      return;
    }

    navigate(
      buildAutomationSeedLink({
        triggerType,
        triggerConfig: scope.triggerConfig,
        name,
        returnTo,
        actions,
      }),
    );
  };

  const connectPoints = () => {
    if (!campaignId) {
      return;
    }

    openSeed(label || '', [
      {
        id: generateAutomationElementId(),
        type: ADJUST_SCORE_ACTION_TYPE,
        config: {
          ...(buyerAttribution ? { attribution: buyerAttribution } : {}),
          campaignId,
          action: 'add',
        },
      },
    ]);
  };

  // A wallet's bands name its own tiers; another wallet starts over.
  const chooseWallet = (id: string) => {
    setWalletId(id);
    setTierBands(EMPTY_TIER_BANDS);
  };

  // One Set tier reading the purchase total against the bands entered here.
  const connectTier = () => {
    const wallet = tierWallets.find(({ _id }) => _id === walletId);

    if (!wallet || !tierBands.bands.length) {
      return;
    }

    openSeed(`${label || ''} · ${wallet.name}`, [
      {
        id: generateAutomationElementId(),
        type: SET_TIER_ACTION_TYPE,
        config: {
          ...(buyerAttribution ? { attribution: buyerAttribution } : {}),
          accountTypeId: wallet._id,
          mode: 'amount',
          tier: '',
          ...tierBands,
        },
      },
    ]);
  };

  return {
    adding,
    setAdding,
    kind,
    setKind,
    creating,
    setCreating,
    pointConnections,
    tierConnections,
    loading,
    error,
    noActivePoints:
      !loading &&
      !error &&
      !pointConnections.some(
        ({ status, incomplete }) => status === 'active' && !incomplete,
      ),
    editPath,
    scopeKey,
    setScopeKey,
    campaignId,
    setCampaignId,
    connectPoints,
    tierWallets,
    walletId,
    setWalletId: chooseWallet,
    selectedWallet: tierWallets.find(({ _id }) => _id === walletId),
    tierBands,
    setTierBands,
    connectTier,
  };
};
