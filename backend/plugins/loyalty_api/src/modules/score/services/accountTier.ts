import { writeAccountTier } from '@/score/services/accountBalance';
import { IModels } from '~/connectionResolvers';

// The single place a tier changes: the account holds it, the owner record's
// tier field mirrors it. Whatever decided the tier is the caller's business.
export const setAccountTier = async ({
  models,
  subdomain,
  accountId,
  accountTypeId,
  tier,
}: {
  models: IModels;
  subdomain: string;
  accountId: string;
  accountTypeId: string;
  tier: string | null;
}) => {
  const accountType = await models.LoyaltyAccountTypes.getActiveAccountType(
    accountTypeId,
  );

  if (
    tier &&
    !(accountType.tiers || []).some(
      ({ key, deprecated }) => key === tier && !deprecated,
    )
  ) {
    throw new Error(`"${tier}" is not a tier of ${accountType.name}`);
  }

  const result = await models.LoyaltyAccounts.setTier({
    accountId,
    accountTypeId,
    tier,
  });

  const account = await models.LoyaltyAccounts.findOne({ _id: accountId });

  if (!account) {
    throw new Error('Loyalty account not found');
  }

  if (!accountType.tierFieldId) {
    return { ...result, account };
  }

  // Same convergence as balances: the last writer corrects an older copy.
  let projected = account.balances?.get(accountTypeId)?.tier ?? null;

  for (let attempt = 0; attempt < 3; attempt++) {
    await writeAccountTier(subdomain, {
      accountTypeId,
      ownerType: accountType.ownerType,
      recordId: account.ownerId,
      tier: projected,
    });

    const latest = await models.LoyaltyAccounts.findOne(
      { _id: accountId },
      { [`balances.${accountTypeId}.tier`]: 1 },
    ).lean();
    const current = latest?.balances?.[accountTypeId]?.tier ?? null;

    if (current === projected) {
      break;
    }

    projected = current;
  }

  return { ...result, account };
};
