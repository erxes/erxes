import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { compactList } from '@/loyalties/utils/cursorList';
import { isRecord } from '@/loyalties/utils/isRecord';
import { useLoyaltyAccountTypes } from '../../../account-type/hooks/useLoyaltyAccountTypes';
import { activeTiers } from '../../../account-type/types';
import { SCORE_CAMPAIGN_AUTOMATIONS } from '../../graphql/queries/scoreCampaignAutomationsQuery';
import {
  ADJUST_SCORE_ACTION_TYPE,
  SET_TIER_ACTION_TYPE,
} from '../constants/campaignAutomations';

const actionConfig = (config: unknown) => (isRecord(config) ? config : {});

export type TCampaignAutomation = {
  _id: string;
  name: string;
  status?: string;
  // Tier automations only: the tiers they set, highest first.
  tiers?: string[];
};

/**
 * The automations giving a campaign's points and the ones setting its account
 * type's tiers.
 */
export const useScoreCampaignAutomations = ({
  campaignId,
  accountTypeId,
}: {
  campaignId: string;
  accountTypeId?: string;
}) => {
  const { accounts } = useLoyaltyAccountTypes({ status: 'active' });
  const accountType = accounts.find(({ _id }) => _id === accountTypeId);

  const { data, loading } = useQuery(SCORE_CAMPAIGN_AUTOMATIONS, {
    variables: {
      actionTypes: [ADJUST_SCORE_ACTION_TYPE, SET_TIER_ACTION_TYPE],
    },
    // Automations are edited elsewhere; coming back must show the change.
    fetchPolicy: 'cache-and-network',
  });

  const { pointAutomations, tierAutomations, hasTiers } = useMemo(() => {
    const records = compactList(data?.automations);
    const tiers = [...activeTiers(accountType?.tiers)].reverse();
    const tierName = (key?: string) =>
      tiers.find((tier) => tier.key === key)?.name || key || '—';
    const tierRank = (key?: string) => {
      const index = tiers.findIndex((tier) => tier.key === key);
      return index === -1 ? tiers.length : index;
    };

    return {
      hasTiers: tiers.length > 0,
      pointAutomations: records
        .filter(({ actions }) =>
          compactList(actions).some(
            ({ type, config }) =>
              type === ADJUST_SCORE_ACTION_TYPE &&
              actionConfig(config).campaignId === campaignId,
          ),
        )
        .map(
          ({ _id, name, status }): TCampaignAutomation => ({
            _id,
            name: name || _id,
            status: status ?? undefined,
          }),
        ),
      tierAutomations: records.flatMap(
        ({ _id, name, status, actions }): TCampaignAutomation[] => {
          const keys = compactList(actions)
            .filter(
              ({ type, config }) =>
                type === SET_TIER_ACTION_TYPE &&
                !!accountTypeId &&
                actionConfig(config).accountTypeId === accountTypeId,
            )
            .map(({ config }) => {
              const tier = actionConfig(config).tier;
              return typeof tier === 'string' ? tier : undefined;
            });

          return keys.length
            ? [
                {
                  _id,
                  name: name || _id,
                  status: status ?? undefined,
                  tiers: [...new Set(keys)]
                    .sort((a, b) => tierRank(a) - tierRank(b))
                    .map(tierName),
                },
              ]
            : [];
        },
      ),
    };
  }, [accountType?.tiers, accountTypeId, campaignId, data]);

  return {
    loading: loading && !data,
    pointAutomations,
    tierAutomations,
    hasTiers,
    accountTypeName: accountType?.name,
  };
};
