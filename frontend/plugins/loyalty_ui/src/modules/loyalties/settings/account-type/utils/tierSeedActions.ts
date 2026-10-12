import { generateAutomationElementId, TAutomationSeedAction } from 'ui-modules';
import { SET_TIER_ACTION_TYPE } from '../../score/add-score-campaign/constants/campaignAutomations';
import { activeTiers, ILoyaltyAccountType } from '../types';

const SPLIT_ACTION_TYPE = 'split';

/**
 * A split with one branch per active tier, highest first so the first match
 * wins, each ending in Set tier. The branch conditions are left for the
 * builder: only the organization knows what earns a tier.
 */
export const buildTierSeedActions = (
  accountType: ILoyaltyAccountType,
  attribution: string,
): TAutomationSeedAction[] => {
  const tiers = [...activeTiers(accountType.tiers)].reverse();

  if (!tiers.length) {
    return [];
  }

  const taken: string[] = [];
  const nextId = () => {
    const id = generateAutomationElementId(taken);
    taken.push(id);
    return id;
  };
  const splitId = nextId();
  const branches = tiers.map((tier) => ({ tier, actionId: nextId() }));

  return [
    {
      id: splitId,
      type: SPLIT_ACTION_TYPE,
      config: {
        options: tiers.map(({ key, name }) => ({
          id: key,
          label: name,
          config: { conditionsConjunction: 'and', conditions: [] },
        })),
        optionalConnects: branches.map(({ tier, actionId }) => ({
          optionalConnectId: tier.key,
          actionId,
        })),
      },
    },
    ...branches.map(({ tier, actionId }) => ({
      id: actionId,
      type: SET_TIER_ACTION_TYPE,
      config: {
        attribution,
        accountTypeId: accountType._id,
        tier: tier.key,
      },
    })),
  ];
};
