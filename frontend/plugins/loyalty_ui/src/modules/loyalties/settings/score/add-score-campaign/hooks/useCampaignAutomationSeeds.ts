import { UseFormReturn, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';
import {
  automationReturnLinkSearch,
  buildAutomationSeedLink,
  generateAutomationElementId,
  TAutomationSeedAction,
} from 'ui-modules';
import { useLoyaltyAccountTypes } from '../../../account-type/hooks/useLoyaltyAccountTypes';
import { activeTiers } from '../../../account-type/types';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';
import {
  ADJUST_SCORE_ACTION_TYPE,
  SET_TIER_ACTION_TYPE,
} from '../constants/campaignAutomations';
import { useScoreCampaignContext } from '../contexts/ScoreCampaignContext';

const CUSTOMER_TRIGGER_TYPE = 'core:contacts.customers';
const SPLIT_ACTION_TYPE = 'split';

/** Opens the builder on an unsaved flow already pointing at this campaign. */
export const useCampaignAutomationSeeds = (
  form: UseFormReturn<LoyaltyScoreFormValues>,
) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { campaignId } = useScoreCampaignContext();
  const [title, accountTypeId] = useWatch({
    control: form.control,
    name: ['title', 'accountTypeId'],
  });
  const { accounts } = useLoyaltyAccountTypes({ status: 'active' });
  const accountType = accounts.find(({ _id }) => _id === accountTypeId);
  // Highest first: the split takes the first branch that matches.
  const tiers = [...activeTiers(accountType?.tiers)].reverse();
  const returnTo = {
    path: `${pathname}${search}`,
    label: title || 'Score campaign',
  };

  // Points can come from any event, so the trigger is left to the user. From a
  // row, the action turns on only that row; otherwise every row counts.
  const createPointAutomation = (rowKey?: string) => {
    if (!campaignId) {
      return;
    }

    navigate(
      buildAutomationSeedLink({
        name: title || '',
        returnTo,
        actions: [
          {
            id: generateAutomationElementId(),
            type: ADJUST_SCORE_ACTION_TYPE,
            config: {
              campaignId,
              action: 'add',
              ...(rowKey ? { earnRowKeys: [rowKey] } : {}),
            },
          },
        ],
      }),
    );
  };

  const createTierAutomation = () => {
    if (!accountType || !tiers.length) {
      return;
    }

    const taken: string[] = [];
    const nextId = () => {
      const id = generateAutomationElementId(taken);
      taken.push(id);
      return id;
    };
    const splitId = nextId();
    const branches = tiers.map((tier) => ({ tier, actionId: nextId() }));

    const actions: TAutomationSeedAction[] = [
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
          attribution: '{{ trigger._id }}',
          accountTypeId: accountType._id,
          tier: tier.key,
        },
      })),
    ];

    navigate(
      buildAutomationSeedLink({
        triggerType: CUSTOMER_TRIGGER_TYPE,
        name: `${accountType.name} tier`,
        returnTo,
        actions,
      }),
    );
  };

  // Opening an existing one keeps the same way back as creating one.
  const editPath = (automationId: string) =>
    `/automations/edit/${automationId}${automationReturnLinkSearch(returnTo)}`;

  return {
    isSaved: !!campaignId,
    editPath,
    canCreateTier: !!campaignId && tiers.length > 0,
    createPointAutomation,
    createTierAutomation,
  };
};
